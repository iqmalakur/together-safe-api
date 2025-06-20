import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { GeocodeResult } from '../modules/shared/shared.type';
import { handleError } from '../utils/common.util';
import { LoggerUtil } from '../utils/logger.util';
import { PrismaService } from './prisma.service';

@Injectable()
export class ApiService {
  private readonly logger: LoggerUtil;

  public constructor(private readonly prisma: PrismaService) {
    this.logger = new LoggerUtil(this.constructor.name);
  }

  public async geocode(query: string): Promise<GeocodeResult[]> {
    const normalizedQuery = query.trim().toLowerCase();

    const cached = await this.prisma.$queryRaw<GeocodeResult[]>`
      SELECT name, display_name, lat, lon
      FROM "NominatimLocation"
      WHERE LOWER(keywords) LIKE ${`%${normalizedQuery}%`}
      ORDER BY CHAR_LENGTH(display_name) ASC
      LIMIT 5;
    `;

    if (cached.length > 0) {
      this.logger.debug(`Cache hit for "${normalizedQuery}"`);
      return cached;
    }

    this.logger.debug(
      `Cache miss for "${normalizedQuery}", querying Nominatim...`,
    );
    const result = await this.sendRequest<GeocodeResult[]>(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&polygon_geojson=1`,
    );

    for (const item of result) {
      await this.saveLocation(item, normalizedQuery);
    }

    return result;
  }

  public async reverseGeocode(
    latitude: number,
    longitude: number,
  ): Promise<GeocodeResult> {
    const cached = await this.prisma.$queryRawUnsafe<GeocodeResult[]>(`
      SELECT name, display_name, lat, lon
      FROM "NominatimLocation"
      WHERE ST_Contains(location, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
      LIMIT 1;
    `);

    if (cached.length > 0) {
      this.logger.debug(`Cache hit for (${latitude}, ${longitude})`);
      return cached[0];
    }

    this.logger.debug(
      `Cache miss for (${latitude}, ${longitude}), querying Nominatim...`,
    );
    const result = await this.sendRequest<GeocodeResult>(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
    );

    this.saveLocation(result);

    return result;
  }

  private async saveLocation(result: GeocodeResult, keyword: string = '') {
    if (!result) {
      this.logger.debug('No result to insert, skipping save');
      return;
    }

    if (!result.osm_id) {
      this.logger.debug('OSM ID not provided, skipping save');
      return;
    }

    if (!result.boundingbox || result.boundingbox.length !== 4) {
      this.logger.debug(
        'Bounding box not available for location, skipping save',
      );
      return;
    }

    try {
      const [south, north, west, east] = result.boundingbox.map(parseFloat);
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO "NominatimLocation" (osm_id, keywords, name, display_name, lat, lon, location)
        VALUES (
          ${BigInt(result.osm_id)},
          '',
          '${result.name}',
          '${result.display_name}',
          '${result.lat}',
          '${result.lon}',
          ST_MakePolygon(ST_GeomFromText('LINESTRING(
            ${west} ${south},
            ${west} ${north},
            ${east} ${north},
            ${east} ${south},
            ${west} ${south}
          )'))
        )
        ON CONFLICT (osm_id)
        DO NOTHING;
      `);

      if (keyword !== '') {
        await this.prisma.$executeRawUnsafe(`
          UPDATE "NominatimLocation"
          SET keywords = CASE
            WHEN keywords ILIKE '%${keyword}%' THEN keywords
            WHEN keywords = '' THEN '${keyword}'
            ELSE CONCAT(keywords, ',', '${keyword}')
          END
          WHERE osm_id = ${BigInt(result.osm_id)};
        `);
      }
    } catch (e) {
      this.logger.debug('failed to cache location');
      this.logger.error(e);
    }
  }

  private async sendRequest<TGeocode>(url: string): Promise<TGeocode> {
    try {
      const result = await axios.get<TGeocode>(url, {
        headers: {
          'User-Agent': 'TogetherSafe/1.0 (iqmalak21@if.unjani.ac.id)',
        },
      });
      return result.data;
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }
}
