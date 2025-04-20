import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { GeocodeResult } from 'src/modules/shared/shared.type';
import { handleError } from 'src/utils/common.util';
import { LoggerUtil } from 'src/utils/logger.util';

@Injectable()
export class ApiService {
  private readonly logger: LoggerUtil;

  public constructor() {
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
    return this.sendRequest<GeocodeResult>(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
    );
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
