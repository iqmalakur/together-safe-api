import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructures/prisma.service';
import { getDate } from '../src/utils/date.util';
import * as CommonUtil from '../src/utils/common.util';

jest.mock('../src/utils/common.util', () => {
  const originalModule = jest.requireActual('../src/utils/common.util');

  return {
    ...originalModule,
    validateToken: jest.fn(),
  };
});

describe('ReportController (e2e)', () => {
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

    (CommonUtil.validateToken as jest.Mock).mockImplementation(
      (token) => token === 'generated_token',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/report (GET)', () => {
    it('should return 200 and list of user incident reports', async () => {
      jest.spyOn(prisma.report, 'findMany').mockResolvedValue([
        {
          id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          description: 'Terjadi pembegalan di Cimahi',
          incident: {
            id: '98f3d8a7-1b2c-4e5d-9f0a-1b2c3d4e5f6a',
            category: { name: 'Pembegalan' },
          },
          latitude: -6.917,
          longitude: 107.619,
          date: getDate('2025-06-01'),
          time: getDate('21:30'),
        },
      ] as any);

      const res = await request(app.getHttpServer())
        .get('/report')
        .set('Authorization', 'Bearer generated_token')
        .expect(200);

      expect(res.body).toEqual([
        {
          id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          description: 'Terjadi pembegalan di Cimahi',
          date: '01 Juni 2025',
          time: '21:30',
          category: 'Pembegalan',
          location: expect.stringContaining('Indonesia'),
        },
      ]);
    });
  });

  describe('/report/{id} (GET)', () => {
    it('should return 200 and incident report detail', async () => {
      const now = new Date();

      jest.spyOn(prisma.report, 'findFirst').mockResolvedValue({
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        description: 'Terjadi pembegalan di Cimahi',
        isAnonymous: false,
        date: getDate('2025-06-01'),
        time: getDate('21:30'),
        latitude: -6.917,
        longitude: 107.619,
        incident: {
          id: '98f3d8a7-1b2c-4e5d-9f0a-1b2c3d4e5f6a',
          category: {
            name: 'Pembegalan',
          },
        },
        user: {
          email: 'budi.santoso@example.com',
          name: 'Budi Santoso',
          profilePhoto: '17ZowAHAXQQCgZSfQV_LaPGwyh6db9dQ9',
        },
        attachments: [
          { uri: '1kH0xU1DQXqU10i8Js-plHsvgQaQKJzxa' },
          { uri: '1KWlz-FsGqcDp9PuzsZIf_0fyC7ee_IRQ' },
        ],
        votes: [{ type: 'upvote' }, { type: 'upvote' }, { type: 'downvote' }],
        comments: [
          {
            id: 1,
            comment: 'Semoga cepat ditangani!',
            createdAt: now,
            updatedAt: new Date(now.getTime() + 1000),
            user: {
              email: 'siti.nurhaliza@example.com',
              name: 'Siti Nurhaliza',
              profilePhoto: '1WyGdqaDUKXGSY_KhxSSrppcT2xJe_z73',
            },
          },
        ],
      } as any);

      const res = await request(app.getHttpServer())
        .get('/report/f47ac10b-58cc-4372-a567-0e02b2c3d479')
        .set('Authorization', 'Bearer generated_token')
        .expect(200);

      expect(res.body).toEqual({
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        incident: {
          id: '98f3d8a7-1b2c-4e5d-9f0a-1b2c3d4e5f6a',
          category: 'Pembegalan',
        },
        user: {
          email: 'budi.santoso@example.com',
          name: 'Budi Santoso',
          profilePhoto:
            'https://drive.google.com/uc?export=view&id=17ZowAHAXQQCgZSfQV_LaPGwyh6db9dQ9',
        },
        isAnonymous: false,
        description: 'Terjadi pembegalan di Cimahi',
        date: '01 Juni 2025',
        time: '21:30',
        location: expect.stringContaining('Indonesia'),
        latitude: -6.917,
        longitude: 107.619,
        attachments: [
          'https://drive.google.com/uc?export=view&id=1kH0xU1DQXqU10i8Js-plHsvgQaQKJzxa',
          'https://drive.google.com/uc?export=view&id=1KWlz-FsGqcDp9PuzsZIf_0fyC7ee_IRQ',
        ],
        comments: [
          {
            id: 1,
            comment: 'Semoga cepat ditangani!',
            createdAt: now.toISOString(),
            isEdited: true,
            user: {
              email: 'siti.nurhaliza@example.com',
              name: 'Siti Nurhaliza',
              profilePhoto:
                'https://drive.google.com/uc?export=view&id=1WyGdqaDUKXGSY_KhxSSrppcT2xJe_z73',
            },
          },
        ],
        upvote: 2,
        downvote: 1,
      });
    });

    it('should return 400 if id is not valid', async () => {
      await request(app.getHttpServer())
        .get('/report/invalid-id')
        .set('Authorization', 'Bearer generated_token')
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: ['ID tidak valid'],
            error: 'Bad Request',
            statusCode: 400,
          });
        });
    });

    it('should return 404 if report is not found', async () => {
      jest.spyOn(prisma.report, 'findFirst').mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/report/f47ac10b-58cc-4372-a567-0e02b2c3d479')
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
