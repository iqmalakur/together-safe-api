import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { GeolocationRepository } from './geolocation.repository';
import { GeoJSONFeatureDTO, GeocodingResDto } from './geolocation.dto';
import { Geometry } from './geolocation.type';

@Injectable()
export class GeolocationService extends BaseService {
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
  ): Promise<GeoJSONFeatureDTO> {
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

    const coordinates: number[][] = [];

    routeResult.forEach((route) => {
      const json = JSON.parse(route.geojson) as Geometry;
      json.coordinates.forEach((coordinate) => {
        const lastCoordinate = coordinates[coordinates.length - 1];

        if (
          coordinates.length == 0 ||
          !this.isCoordinateEquals(coordinate, lastCoordinate)
        )
          coordinates.push(coordinate);
      });
    });

    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates,
      },
      properties: {},
    };
  }

  private isCoordinateEquals(first: number[], second: number[]): boolean {
    return first[0] === second[0] && first[1] === second[1];
  }
}
