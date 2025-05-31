import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructures/prisma.service';
import { getDate } from '../src/utils/date.util';
import * as CommonUtil from '../src/utils/common.util';

jest.mock('../src/utils/common.util', () => ({
  validateToken: jest.fn(),
}));

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
          id: 'a1b2c3d4-e5f6-7890-ab12-cd34ef56gh78',
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
          id: 'a1b2c3d4-e5f6-7890-ab12-cd34ef56gh78',
          description: 'Terjadi pembegalan di Cimahi',
          date: '01 Juni 2025',
          time: '21:30',
          category: 'Pembegalan',
          location: expect.stringContaining('Indonesia'),
        },
      ]);
    });
  });
});
