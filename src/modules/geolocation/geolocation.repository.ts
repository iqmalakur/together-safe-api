import { Injectable } from '@nestjs/common';
import { GeolocationResult, NominatimResponse } from './geolocation.type';
import axios from 'axios';
import { handleError } from '../../utils/common.util';
import { BaseRepository } from '../shared/base.repository';

export interface IGeolocationRepository {
  findLocation(query: string): Promise<GeolocationResult[]>;
}

@Injectable()
export class GeolocationRepository
  extends BaseRepository
  implements IGeolocationRepository
{
  public async findLocation(query: string): Promise<GeolocationResult[]> {
    const result: GeolocationResult[] = [];

    try {
      const response = await axios.get<NominatimResponse>(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=geojson`,
      );

      response.data.features.forEach((feature) => {
        result.push({
          name: feature.properties.name,
          fullName: feature.properties.display_name,
          coordinates: feature.geometry.coordinates,
        });
      });
    } catch (e) {
      handleError(e, this.logger);
    }

    return result;
  }
}
