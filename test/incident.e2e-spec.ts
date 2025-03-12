import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/services/prisma.service';

describe('IncidentController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/incident (GET) should return list of incidents', async () => {
    jest.spyOn(prisma.incident, 'findMany').mockResolvedValue([
      {
        id: 'abc',
        category: { name: 'Pembegalan' },
        dateStart: new Date('2025-01-01'),
        dateEnd: new Date('2025-01-01'),
        timeStart: new Date('2025-01-01T21:00:00Z'),
        timeEnd: new Date('2025-01-01T23:00:00Z'),
        riskLevel: 'high',
        latitude_centroid: 37.7749,
        longitude_centroid: -122.4194,
        status: 'active',
        reports: [
          {
            id: 'r_abc',
            description: 'lorem ipsum dolor sit amet',
            attachments: [{ uri: 'https://example.com/image1.jpg' }],
          },
        ],
      },
    ] as any);

    return request(app.getHttpServer())
      .get('/incident')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              category: 'Pembegalan',
              date: '01 Januari 2025',
              time: '21:00 ~ 23:00',
              riskLevel: 'high',
              location: expect.any(String),
              latitude: 37.7749,
              longitude: -122.4194,
              status: 'active',
              reports: [
                {
                  id: 'r_abc',
                  description: 'lorem ipsum dolor sit amet',
                },
              ],
              mediaUrls: ['https://example.com/image1.jpg'],
            }),
          ]),
        );
      });
  });
});
