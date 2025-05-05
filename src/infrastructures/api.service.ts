import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { GeocodeResult } from 'src/modules/shared/shared.type';
import { handleError } from 'src/utils/common.util';
import { LoggerUtil } from 'src/utils/logger.util';
import { PrismaService } from './prisma.service';
import { SRID_WGS84 } from 'src/constants/map.constant';

@Injectable()
export class ApiService {
  private readonly logger: LoggerUtil;

  public constructor(private readonly prisma: PrismaService) {
    this.logger = new LoggerUtil(this.constructor.name);
  }

  public async geocode(query: string): Promise<GeocodeResult[]> {
    return this.sendRequest<GeocodeResult[]>(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json`,
    );
  }

  public async reverseGeocode(
    latitude: number,
    longitude: number,
  ): Promise<GeocodeResult> {
    const cached = await this.prisma.$queryRawUnsafe<GeocodeResult[]>(`
      SELECT name, display_name, lat, lon
      FROM "NominatimLocation"
      WHERE ST_Contains(location, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), ${SRID_WGS84}))
      LIMIT 1;
    `);

    if (cached.length > 0) {
      return cached[0];
    }

    const result = await this.sendRequest<GeocodeResult>(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
    );

    this.saveLocation(result);

    return result;
  }

  private async saveLocation(result: GeocodeResult) {
    if (!result) {
      this.logger.debug('No result to insert, skipping save');
      return;
    }

    if (!result.osm_id) {
      this.logger.debug('OSM ID not found, skipping save');
      return;
    }

    if (!result.boundingbox || result.boundingbox.length !== 4) {
      this.logger.debug(
        'Bounding box not available for location, skipping save',
      );
      return;
    }

    const [south, north, west, east] = result.boundingbox.map(parseFloat);
    const insertQuery = `
      INSERT INTO "NominatimLocation" (osm_id, name, display_name, lat, lon, location)
      VALUES (
        ${BigInt(result.osm_id)},
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
    `;

    await this.prisma.$executeRawUnsafe(insertQuery);
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
