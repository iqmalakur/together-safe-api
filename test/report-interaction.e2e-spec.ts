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
});
