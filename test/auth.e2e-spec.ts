import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructures/prisma.service';
import { sign } from 'jsonwebtoken';
import { SECRET_KEY } from '../src/config/app.config';
import { UploadService } from '../src/infrastructures/upload.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let uploadService: UploadService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    uploadService = moduleFixture.get<UploadService>(UploadService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should return 200 and JWT token', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue({
        email: 'budi.santoso@example.com',
        name: 'Budi Santoso',
        profilePhoto: '17ZowAHAXQQCgZSfQV_LaPGwyh6db9dQ9',
        password: bcrypt.hashSync('budiSantoso123', 10),
      });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'budi.santoso@example.com',
          password: 'budiSantoso123',
        })
        .expect(200);

      expect(res.body).toEqual({
        email: 'budi.santoso@example.com',
        name: 'Budi Santoso',
        profilePhoto:
          'https://drive.google.com/uc?export=view&id=17ZowAHAXQQCgZSfQV_LaPGwyh6db9dQ9',
        token: expect.any(String),
      });
    });

    it('should return 400 if input are not valid', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'coba',
        })
        .expect(400);

      expect(res.body).toEqual({
        message: expect.arrayContaining([
          'Email tidak valid',
          'Password harus diisi',
        ]),
        error: 'Bad Request',
        statusCode: 400,
      });
    });

    it('should return 401 if email or password are not valid', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'budi.santoso@example.com',
          password: 'budiSantoso123',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Email atau Password salah!',
            error: 'Unauthorized',
            statusCode: 401,
          });
        });

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue({
        email: 'budi.santoso@example.com',
        name: 'Budi Santoso',
        profilePhoto: '17ZowAHAXQQCgZSfQV_LaPGwyh6db9dQ9',
        password: bcrypt.hashSync('budiSantoso123', 10),
      });

      return await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'budi.santoso@example.com',
          password: 'budiSantoso121',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Email atau Password salah!',
            error: 'Unauthorized',
            statusCode: 401,
          });
        });
    });
  });

  describe('/auth/register (POST)', () => {
    it('should return 201 and JWT token', async () => {
      const user = {
        email: 'budi.santoso@example.com',
        name: 'Budi Santoso',
        profilePhoto: __dirname + '/files/incident.jpg',
        password: 'budiSantoso123',
      };

      jest.spyOn(prisma.user, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.user, 'create').mockResolvedValue({
        email: 'budi.santoso@example.com',
      } as any);

      const uploadFile = jest
        .spyOn(uploadService, 'uploadFile')
        .mockResolvedValue('17ZowAHAXQQCgZSfQV_LaPGwyh6db9dQ9');

      await request(app.getHttpServer())
        .post('/auth/register')
        .field('email', user.email)
        .field('name', user.name)
        .field('password', user.password)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({
            id: 'budi.santoso@example.com',
            message: 'Pendaftaran pengguna berhasil',
          });
        });

      expect(uploadFile).not.toHaveBeenCalled();

      await request(app.getHttpServer())
        .post('/auth/register')
        .field('email', user.email)
        .field('name', user.name)
        .field('password', user.password)
        .attach('profilePhoto', user.profilePhoto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({
            id: 'budi.santoso@example.com',
            message: 'Pendaftaran pengguna berhasil',
          });
        });

      expect(uploadFile).toHaveBeenCalled();
    });

    it('should return 400 if input are not valid', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .field('email', 'coba')
        .field('password', 'admin')
        .expect(400);

      expect(res.body).toEqual({
        message: expect.arrayContaining([
          'Email tidak valid',
          'Password minimal terdiri dari 8 karakter',
          'Nama harus diisi',
        ]),
        error: 'Bad Request',
        statusCode: 400,
      });
    });

    it('should return 409 if email already exist', async () => {
      jest.spyOn(prisma.user, 'count').mockResolvedValue(1);

      await request(app.getHttpServer())
        .post('/auth/register')
        .field('email', 'budi.santoso@example.com')
        .field('password', 'budiSantoso123')
        .field('name', 'Budi Santoso')
        .expect(409)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Email sudah terdaftar!',
            error: 'Conflict',
            statusCode: 409,
          });
        });
    });
  });

  describe('/auth/validate-token (POST)', () => {
    it('should return 200 and JWT token', async () => {
      const token = sign(
        {
          email: 'budi.santoso@example.com',
          name: 'Budi Santoso',
          profilePhoto: '17ZowAHAXQQCgZSfQV_LaPGwyh6db9dQ9',
        },
        SECRET_KEY,
        { expiresIn: '1w' },
      );

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue({
        email: 'budi.santoso@example.com',
        name: 'Budi Santoso',
        profilePhoto: '17ZowAHAXQQCgZSfQV_LaPGwyh6db9dQ9',
        password: bcrypt.hashSync('budiSantoso123', 10),
      });

      const res = await request(app.getHttpServer())
        .post('/auth/validate-token')
        .send({ token })
        .expect(200);

      expect(res.body).toEqual({
        email: 'budi.santoso@example.com',
        name: 'Budi Santoso',
        profilePhoto:
          'https://drive.google.com/uc?export=view&id=17ZowAHAXQQCgZSfQV_LaPGwyh6db9dQ9',
        token: expect.any(String),
      });
    });

    it('should return 400 if token is not provided', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/validate-token')
        .expect(400);

      expect(res.body).toEqual({
        message: expect.arrayContaining(['Token harus diisi']),
        error: 'Bad Request',
        statusCode: 400,
      });
    });

    it('should return 401 if token is not valid', async () => {
      await request(app.getHttpServer())
        .post('/auth/validate-token')
        .send({ token: 'abc' })
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Token tidak valid!',
            error: 'Unauthorized',
            statusCode: 401,
          });
        });

      const token = sign(
        {
          email: 'budi.santoso@example.com',
          name: 'Budi Santoso',
          profilePhoto: '17ZowAHAXQQCgZSfQV_LaPGwyh6db9dQ9',
        },
        SECRET_KEY,
        { expiresIn: '1w' },
      );

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/auth/validate-token')
        .send({ token })
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Token tidak valid!',
            error: 'Unauthorized',
            statusCode: 401,
          });
        });
    });
  });
});
