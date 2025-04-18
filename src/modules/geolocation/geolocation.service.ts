import { Injectable } from '@nestjs/common';
import { GeolocationRepository } from './geolocation.repository';
import { SafeRouteResDto, GeocodingResDto } from './geolocation.dto';
import { Geometry } from './geolocation.type';
import { AbstractLogger } from '../shared/abstract-logger';

@Injectable()
export class GeolocationService extends AbstractLogger {
  public constructor(private readonly repository: GeolocationRepository) {
    super();
  }

  public async handleSearchLocation(query: string): Promise<GeocodingResDto[]> {
    const locations = await this.repository.findLocation(query);
    const result: GeocodingResDto[] = locations.map((location) => ({
      name: location.name,
      fullName: location.display_name,
      latitude: location.lat,
      longitude: location.lon,
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

    const routes: number[][] = [];

    routeResult.forEach((route) => {
      const json = JSON.parse(route.geojson) as Geometry;
      json.coordinates.forEach((coordinate) => {
        const lastCoordinate = routes[routes.length - 1];

        if (
          routes.length == 0 ||
          !this.isCoordinateEquals(coordinate, lastCoordinate)
        )
          routes.push(coordinate);
      });
    });

    return { routes };
  }

  private isCoordinateEquals(first: number[], second: number[]): boolean {
    return first[0] === second[0] && first[1] === second[1];
  }
}
