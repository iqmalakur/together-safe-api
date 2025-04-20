import { Injectable } from '@nestjs/common';
import { GeolocationRepository } from './geolocation.repository';
import { SafeRouteResDto, GeocodingResDto } from './geolocation.dto';
import { Geometry } from './geolocation.type';
import { AbstractLogger } from '../shared/abstract-logger';
import { ApiService } from 'src/infrastructures/api.service';

@Injectable()
export class GeolocationService extends AbstractLogger {
  public constructor(
    private readonly apiService: ApiService,
    private readonly repository: GeolocationRepository,
  ) {
    super();
  }

  public async handleSearchLocation(query: string): Promise<GeocodingResDto[]> {
    const locations = await this.apiService.geocode(query);
    const result: GeocodingResDto[] = locations.map((location) => ({
      name: location.name,
      fullName: location.display_name,
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lon),
    }));

    return result;
  }

  public async handleGetSafeRoute(
    start: string,
    end: string,
  ): Promise<SafeRouteResDto> {
    const [startLat, startLon] = start
      .split(',')
      .map((coord) => parseFloat(coord));
    const [endLat, endLon] = end.split(',').map((coord) => parseFloat(coord));

    const routeResult = await this.repository.findSafeRouteWithAStar(
      startLat,
      startLon,
      endLat,
      endLon,
    );

    const routes: number[][][] = [];

    routeResult.forEach((route) => {
      const json = JSON.parse(route.geojson) as Geometry;
      routes.push(json.coordinates);
    });

    return { routes };
  }
}
