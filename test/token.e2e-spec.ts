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
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 200 for valid token', async () => {
    (CommonUtil.validateToken as jest.Mock).mockImplementation((token) =>
      token === 'generated_token'
        ? {
            email: 'budi.santoso@example.com',
            name: 'Budi Santoso',
            profilePhoto: '17ZowAHAXQQCgZSfQV_LaPGwyh6db9dQ9',
          }
        : null,
    );

    jest.spyOn(prisma.report, 'findMany').mockResolvedValue([]);

    await request(app.getHttpServer())
      .get('/report')
      .set('Authorization', 'Bearer generated_token')
      .expect(200);
  });

  it('should return 400 if token is not provided', async () => {
    await request(app.getHttpServer())
      .get('/report')
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual({
          message: ['token harus diisi'],
          error: 'Bad Request',
          statusCode: 400,
        });
      });
  });

  it('should return 400 if token format is not valid', async () => {
    await request(app.getHttpServer())
      .get('/report')
      .set('Authorization', 'invalid_token_format')
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual({
          message: ['format token tidak valid'],
          error: 'Bad Request',
          statusCode: 400,
        });
      });
  });

  it('should return 401 if token is not valid', async () => {
    (CommonUtil.validateToken as jest.Mock).mockReturnValue(null);

    await request(app.getHttpServer())
      .get('/report')
      .set('Authorization', 'Bearer invalid_token')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({
          message: 'token tidak valid',
          error: 'Unauthorized',
          statusCode: 401,
        });
      });
  });
});
