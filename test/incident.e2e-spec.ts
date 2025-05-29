import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructures/prisma.service';

describe('IncidentController (e2e)', () => {
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

  describe('/incident (GET)', () => {
    it('should return 200 and list of nearby incidents', async () => {
      jest.spyOn(prisma, '$queryRaw').mockResolvedValue([
        {
          id: '11111111-1111-1111-1111-111111111111',
          status: 'pending',
          risk_level: 'high',
          date_start: new Date('2025-05-25'),
          date_end: new Date('2025-05-30'),
          time_start: new Date('1970-01-01T08:00:00Z'),
          time_end: new Date('1970-01-01T18:00:00Z'),
          radius: 200,
          latitude: -6.9175,
          longitude: 107.6191,
          category: 'Kebakaran',
        },
      ]);

      return request(app.getHttpServer())
        .get('/incident')
        .query({
          lat: -6.917,
          lon: 107.619,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([
            {
              id: '11111111-1111-1111-1111-111111111111',
              date: '25 Mei 2025 ~ 30 Mei 2025',
              time: '08:00 ~ 18:00',
              status: 'pending',
              latitude: -6.9175,
              longitude: 107.6191,
              location: expect.stringContaining('Indonesia'),
              category: 'Kebakaran',
              radius: 200,
              riskLevel: 'high',
            },
          ]);
        });
    });

    it('should return 400 for unprovided latitude or longitude', async () => {
      jest.spyOn(prisma, '$queryRaw').mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/incident')
        .expect(400);

      expect(response.body).toEqual({
        message: expect.arrayContaining([
          'Latitude tidak valid',
          'Latitude wajib diisi',
          'Longitude tidak valid',
          'Longitude wajib diisi',
        ]),
        error: 'Bad Request',
        statusCode: 400,
      });
    });

    it('should return 400 for invalid latitude or longitude', async () => {
      jest.spyOn(prisma, '$queryRaw').mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/incident')
        .query({
          lat: 'abc',
          lon: 'abc',
        })
        .expect(400);

      expect(response.body).toEqual({
        message: expect.arrayContaining([
          'Latitude tidak valid',
          'Longitude tidak valid',
        ]),
        error: 'Bad Request',
        statusCode: 400,
      });
    });
  });
});
