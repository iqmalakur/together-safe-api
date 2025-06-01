import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructures/prisma.service';
import { sign } from 'jsonwebtoken';
import { SECRET_KEY } from '../src/config/app.config';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
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

  describe('/auth/validate_token (POST)', () => {
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
        .post('/auth/validate_token')
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
        .post('/auth/validate_token')
        .expect(400);

      expect(res.body).toEqual({
        message: expect.arrayContaining(['Token harus diisi']),
        error: 'Bad Request',
        statusCode: 400,
      });
    });

    it('should return 401 if email or password are not valid', async () => {
      await request(app.getHttpServer())
        .post('/auth/validate_token')
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
        .post('/auth/validate_token')
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
