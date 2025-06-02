import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructures/prisma.service';
import { getDate } from '../src/utils/date.util';
import * as CommonUtil from '../src/utils/common.util';
import { UploadService } from '../src/infrastructures/upload.service';

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

  describe('/report (POST)', () => {
    it('should return 201 and create a new report', async () => {
      jest.spyOn(prisma.incidentCategory, 'findFirst').mockResolvedValue({
        id: 1,
        name: 'Kriminalitas',
        minRiskLevel: 'medium',
        maxRiskLevel: 'high',
      } as any);

      jest.spyOn(prisma, '$queryRaw').mockResolvedValueOnce([
        {
          id: '98f3d8a7-1b2c-4e5d-9f0a-1b2c3d4e5f6a',
          radius: 50,
          min_risk_level: 'medium',
          max_risk_level: 'high',
          risk_level: 'medium',
          date_start: getDate('2025-06-01'),
          date_end: getDate('2025-06-02'),
          time_start: getDate('14:00'),
          time_end: getDate('16:00'),
        },
      ]);

      jest.spyOn(prisma.report, 'findFirst').mockResolvedValue(null);

      jest
        .spyOn(uploadService, 'uploadFiles')
        .mockResolvedValue(['1A2b3C4d5E6F7g8H9iJ0kLmNOpQrStUvWx']);

      jest.spyOn(prisma, '$transaction').mockResolvedValue({
        latitude: -6.917,
        longitude: 107.619,
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        date: getDate('2025-06-01'),
        time: getDate('12:30'),
      });

      jest.spyOn(prisma.report, 'count').mockResolvedValue(1);

      await request(app.getHttpServer())
        .post('/report')
        .set('Authorization', 'Bearer generated_token')
        .field('categoryId', '1')
        .field('description', 'Terjadi pembegalan di Cimahi')
        .field('location', '-6.917,107.619')
        .field('date', '2025-06-01')
        .field('time', '12:30')
        .field('isAnonymous', 'false')
        .attach('media', __dirname + '/files/incident.jpg')
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({
            id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            message: 'Berhasil membuat laporan insiden',
          });
        });
    });

    it('should return 400 if input is not valid', async () => {
      const res = await request(app.getHttpServer())
        .post('/report')
        .set('Authorization', 'Bearer generated_token')
        .field('categoryId', 'invalid')
        .field('location', 'a,b')
        .field('date', '01 Juni 2025')
        .field('time', '12 30')
        .field('isAnonymous', 'no')
        .expect(400);

      expect(res.body).toEqual({
        message: expect.arrayContaining([
          'Kategori ID tidak valid',
          'Deskripsi tidak boleh kosong',
          'Format lokasi harus `latitude,longitude`',
          'Format tanggal harus YYYY-MM-DD',
          'Format waktu harus HH:mm',
          'IsAnonymous tidak valid',
        ]),
        error: 'Bad Request',
        statusCode: 400,
      });
    });

    it('should return 400 if category is not exists', async () => {
      jest.spyOn(prisma.incidentCategory, 'findFirst').mockResolvedValue(null);

      return await request(app.getHttpServer())
        .post('/report')
        .set('Authorization', 'Bearer generated_token')
        .field('categoryId', '1')
        .field('description', 'Terjadi pembegalan di Cimahi')
        .field('location', '-6.917,107.619')
        .field('date', '2025-06-01')
        .field('time', '12:30')
        .field('isAnonymous', 'false')
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: ['Kategori tidak ditemukan'],
            error: 'Bad Request',
            statusCode: 400,
          });
        });
    });

    it('should return 409 if user send the duplicate report', async () => {
      jest.spyOn(prisma.incidentCategory, 'findFirst').mockResolvedValue({
        id: 1,
        name: 'Kriminalitas',
        minRiskLevel: 'medium',
        maxRiskLevel: 'high',
      } as any);

      jest.spyOn(prisma, '$queryRaw').mockResolvedValueOnce([
        {
          id: '98f3d8a7-1b2c-4e5d-9f0a-1b2c3d4e5f6a',
          radius: 50,
          min_risk_level: 'medium',
          max_risk_level: 'high',
          risk_level: 'medium',
          date_start: getDate('2025-06-01'),
          date_end: getDate('2025-06-02'),
          time_start: getDate('14:00'),
          time_end: getDate('16:00'),
        },
      ]);

      jest.spyOn(prisma.report, 'findFirst').mockResolvedValue({
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      } as any);

      return await request(app.getHttpServer())
        .post('/report')
        .set('Authorization', 'Bearer generated_token')
        .field('categoryId', '1')
        .field('description', 'Terjadi pembegalan di Cimahi')
        .field('location', '-6.917,107.619')
        .field('date', '2025-06-01')
        .field('time', '12:30')
        .field('isAnonymous', 'false')
        .expect(409)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Laporan serupa telah anda kirim tanggal 2025-06-01',
            error: 'Conflict',
            statusCode: 409,
          });
        });
    });
  });
});
