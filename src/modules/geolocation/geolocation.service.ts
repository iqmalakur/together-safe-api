import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import {
  GeolocationRepository,
  IGeolocationRepository,
} from './geolocation.repository';
import { GeolocationResDto } from './geolocation.dto';

@Injectable()
export class GeolocationService extends BaseService<IGeolocationRepository> {
  public constructor(repository: GeolocationRepository) {
    super(repository);
  }

  public async handleSearchLocation(
    query: string,
  ): Promise<GeolocationResDto[]> {
    const locations = await this.repository.findLocation(query);
    const result: GeolocationResDto[] = locations.map((location) => ({
      name: location.name,
      fullName: location.fullName,
      longitude: location.coordinates[0],
      latitude: location.coordinates[1],
    }));

    return result;
  }
}
