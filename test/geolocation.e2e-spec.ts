import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructures/prisma.service';
import { ApiService } from '../src/infrastructures/api.service';

describe('GeolocationController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let apiService: ApiService;

  const geocodeRawData = {
    osm_id: 987654321,
    name: 'Bandung',
    display_name: 'Bandung, Jawa Barat, Indonesia',
    lat: '-6.917464',
    lon: '107.619123',
    boundingbox: ['-6.975000', '-6.850000', '107.560000', '107.680000'],
  };

  const geocodeResultData = {
    name: 'Bandung',
    fullName: 'Bandung, Jawa Barat, Indonesia',
    latitude: -6.917464,
    longitude: 107.619123,
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    apiService = moduleFixture.get<ApiService>(ApiService);

    jest.spyOn(apiService, 'geocode').mockResolvedValue([geocodeRawData]);
    jest.spyOn(apiService, 'reverseGeocode').mockResolvedValue(geocodeRawData);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/geolocation/search (GET)', () => {
    it('should return 200 and list of locations', async () => {
      return request(app.getHttpServer())
        .get('/geolocation/search')
        .query({ q: 'bandung' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([geocodeResultData]);
        });
    });

    it('should return 400 if query is empty', async () => {
      return request(app.getHttpServer())
        .get('/geolocation/search')
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: [
              "Query parameter 'q' wajib diisi sebagai query pencarian",
            ],
            error: 'Bad Request',
            statusCode: 400,
          });
        });
    });
  });

  describe('/geolocation/location (GET)', () => {
    it('should return 200 and location detail', async () => {
      return request(app.getHttpServer())
        .get('/geolocation/location')
        .query({ lat: '-6.917464', lon: '107.619123' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(geocodeResultData);
        });
    });

    it('should return 400 if latitude or longitude is empty', async () => {
      const res = await request(app.getHttpServer())
        .get('/geolocation/location')
        .query({ lat: 'a,b', lon: 'a,b' })
        .expect(400);

      expect(res.body).toEqual({
        message: expect.arrayContaining([
          'Latitude tidak valid',
          'Longitude tidak valid',
        ]),
        error: 'Bad Request',
        statusCode: 400,
      });
    });
  });

  describe('/geolocation/safe-route (GET)', () => {
    it('should return 200 and safe route', async () => {
      jest.spyOn(prisma, '$queryRaw').mockResolvedValue([
        {
          geojson:
            '{"type":"LineString","coordinates":[[107.84513,-6.20876],[107.84600,-6.20880]]}',
        },
        {
          geojson:
            '{"type":"LineString","coordinates":[[107.84600,-6.20880],[107.84720,-6.20910]]}',
        },
        {
          geojson:
            '{"type":"LineString","coordinates":[[107.84720,-6.20910],[107.84810,-6.20950]]}',
        },
      ]);

      return request(app.getHttpServer())
        .get('/geolocation/safe-route')
        .query({
          startLatLon: '-6.20876,107.84513',
          endLatLon: '-6.2095,107.8481',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            routes: [
              [
                [107.84513, -6.20876],
                [107.846, -6.2088],
              ],
              [
                [107.846, -6.2088],
                [107.8472, -6.2091],
              ],
              [
                [107.8472, -6.2091],
                [107.8481, -6.2095],
              ],
            ],
          });
        });
    });

    it('should return 400 if startLatLon or endLatLon is empty', async () => {
      const res = await request(app.getHttpServer())
        .get('/geolocation/safe-route')
        .query({ startLatLon: 'a,b', endLatLon: 'a,b' })
        .expect(400);

      expect(res.body).toEqual({
        message: expect.arrayContaining([
          'Format lokasi awal harus latitude,longitude',
          'Format lokasi akhir harus latitude,longitude',
        ]),
        error: 'Bad Request',
        statusCode: 400,
      });
    });
  });
});
