import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructures/prisma.service';
import * as CommonUtil from '../src/utils/common.util';

jest.mock('../src/utils/common.util', () => {
  const originalModule = jest.requireActual('../src/utils/common.util');

  return {
    ...originalModule,
    validateToken: jest.fn(),
  };
});

describe('ReportInteractionController (e2e)', () => {
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

    (CommonUtil.validateToken as jest.Mock).mockImplementation((token) =>
      token === 'generated_token'
        ? {
            email: 'budi.santoso@example.com',
            name: 'Budi Santoso',
            profilePhoto: '17ZowAHAXQQCgZSfQV_LaPGwyh6db9dQ9',
          }
        : null,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/report/{reportId}/vote (GET)', () => {
    it('should return 200 and user vote information', async () => {
      jest.spyOn(prisma.report, 'findFirst').mockResolvedValue({
        incidentId: '98f3d8a7-1b2c-4e5d-9f0a-1b2c3d4e5f6a',
        userEmail: 'budi.santoso@example.com',
        isAnonymous: false,
        votes: [{ type: 'upvote' }],
      } as any);

      jest.spyOn(prisma.vote, 'findFirst').mockResolvedValue({
        reportId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        type: 'upvote',
        userEmail: 'budi.santoso@example.com',
      });

      await request(app.getHttpServer())
        .get('/report/f47ac10b-58cc-4372-a567-0e02b2c3d479/vote')
        .set('Authorization', 'Bearer generated_token')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            reportId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            type: 'upvote',
            userEmail: 'budi.santoso@example.com',
          });
        });

      jest.spyOn(prisma.vote, 'findFirst').mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/report/f47ac10b-58cc-4372-a567-0e02b2c3d479/vote')
        .set('Authorization', 'Bearer generated_token')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            reportId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            type: null,
            userEmail: 'budi.santoso@example.com',
          });
        });
    });

    it('should return 400 if report id is not valid', () => {
      return request(app.getHttpServer())
        .get('/report/invalid-id/vote')
        .set('Authorization', 'Bearer generated_token')
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: ['ID laporan tidak valid'],
            error: 'Bad Request',
            statusCode: 400,
          });
        });
    });

    it('should return 404 if report is not found', () => {
      jest.spyOn(prisma.report, 'findFirst').mockResolvedValue(null);

      return request(app.getHttpServer())
        .get('/report/f47ac10b-58cc-4372-a567-0e02b2c3d479/vote')
        .set('Authorization', 'Bearer generated_token')
        .expect(404)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Laporan tidak ditemukan',
            error: 'Not Found',
            statusCode: 404,
          });
        });
    });
  });

  describe('/report/{reportId}/comment (POST)', () => {
    it('should return 201 and submitted comment', async () => {
      jest.spyOn(prisma.report, 'findFirst').mockResolvedValue({
        incidentId: '98f3d8a7-1b2c-4e5d-9f0a-1b2c3d4e5f6a',
        userEmail: 'budi.santoso@example.com',
        isAnonymous: false,
        votes: [{ type: 'upvote' }],
      } as any);

      jest.spyOn(prisma.comment, 'create').mockResolvedValue({
        id: 1,
        comment: 'Saya juga melihat kejadian ini, sangat meresahkan.',
        createdAt: new Date('2025-06-01T08:30:00Z'),
        updatedAt: new Date('2025-06-01T08:30:00Z'),
        user: {
          email: 'budi.santoso@example.com',
          name: 'Budi Santoso',
          profilePhoto: '17ZowAHAXQQCgZSfQV_LaPGwyh6db9dQ9',
        },
      } as any);

      await request(app.getHttpServer())
        .post('/report/f47ac10b-58cc-4372-a567-0e02b2c3d479/comment')
        .set('Authorization', 'Bearer generated_token')
        .send({ comment: 'Saya juga melihat kejadian ini, sangat meresahkan.' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({
            id: 1,
            comment: 'Saya juga melihat kejadian ini, sangat meresahkan.',
            createdAt: '2025-06-01T08:30:00.000Z',
            isEdited: false,
            user: {
              email: 'budi.santoso@example.com',
              name: 'Budi Santoso',
              profilePhoto:
                'https://drive.google.com/uc?export=view&id=17ZowAHAXQQCgZSfQV_LaPGwyh6db9dQ9',
            },
          });
        });
    });

    it('should return 400 if report id is not valid', () => {
      return request(app.getHttpServer())
        .post('/report/f47ac10b-58cc-4372-a567-0e02b2c3d479/comment')
        .set('Authorization', 'Bearer generated_token')
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: ['Komentar tidak boleh kosong'],
            error: 'Bad Request',
            statusCode: 400,
          });
        });
    });

    it('should return 404 if report is not found', () => {
      jest.spyOn(prisma.report, 'findFirst').mockResolvedValue(null);

      return request(app.getHttpServer())
        .post('/report/f47ac10b-58cc-4372-a567-0e02b2c3d479/comment')
        .set('Authorization', 'Bearer generated_token')
        .send({ comment: 'Saya juga melihat kejadian ini, sangat meresahkan.' })
        .expect(404)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Laporan tidak ditemukan',
            error: 'Not Found',
            statusCode: 404,
          });
        });
    });
  });

  describe('/report/comment/{id} (PATCH)', () => {
    it('should return 200 and edited comment', async () => {
      jest
        .spyOn(prisma.comment, 'findFirst')
        .mockResolvedValue({ id: 1 } as any);

      jest.spyOn(prisma.comment, 'update').mockResolvedValue({
        id: 1,
        comment: 'Saya juga melihat kejadian ini, sangat meresahkan.',
        createdAt: new Date('2025-06-01T08:30:00Z'),
        updatedAt: new Date('2025-06-01T09:00:00Z'),
        user: {
          email: 'budi.santoso@example.com',
          name: 'Budi Santoso',
          profilePhoto: '17ZowAHAXQQCgZSfQV_LaPGwyh6db9dQ9',
        },
      } as any);

      await request(app.getHttpServer())
        .patch('/report/comment/1')
        .send({ comment: 'Saya juga melihat kejadian ini, sangat meresahkan.' })
        .set('Authorization', 'Bearer generated_token')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: 1,
            comment: 'Saya juga melihat kejadian ini, sangat meresahkan.',
            createdAt: '2025-06-01T08:30:00.000Z',
            isEdited: true,
            user: {
              email: 'budi.santoso@example.com',
              name: 'Budi Santoso',
              profilePhoto:
                'https://drive.google.com/uc?export=view&id=17ZowAHAXQQCgZSfQV_LaPGwyh6db9dQ9',
            },
          });
        });
    });

    it('should return 400 if report id is not valid', () => {
      return request(app.getHttpServer())
        .patch('/report/comment/1')
        .set('Authorization', 'Bearer generated_token')
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: ['Komentar tidak boleh kosong'],
            error: 'Bad Request',
            statusCode: 400,
          });
        });
    });

    it('should return 404 if report is not found', () => {
      jest.spyOn(prisma.comment, 'findFirst').mockResolvedValue(null);

      return request(app.getHttpServer())
        .patch('/report/comment/1')
        .set('Authorization', 'Bearer generated_token')
        .send({ comment: 'Saya juga melihat kejadian ini, sangat meresahkan.' })
        .expect(404)
        .expect((res) => {
          expect(res.body).toEqual({
            message:
              'Komentar tidak ditemukan atau Anda tidak memiliki komentar ini',
            error: 'Not Found',
            statusCode: 404,
          });
        });
    });
  });
});
