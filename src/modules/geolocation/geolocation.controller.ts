import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GeolocationService } from './geolocation.service';
import {
  SafeRouteResDto,
  GeocodingResDto,
  GeocodingQueryDto,
  SafeRouteQueryDto,
  LatLonQueryDto,
} from './geolocation.dto';
import {
  ApiLocation,
  ApiSafeRoute,
  ApiSearch,
} from 'src/decorators/api-geolocation.decorator';
import { AbstractLogger } from '../shared/abstract-logger';

@Controller('geolocation')
@ApiTags('Geolocation')
export class GeolocationController extends AbstractLogger {
  public constructor(private readonly service: GeolocationService) {
    super();
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiSearch()
  public async search(
    @Query() queryParam: GeocodingQueryDto,
  ): Promise<GeocodingResDto[]> {
    if (queryParam.q === '') return [];
    return this.service.handleSearchLocation(queryParam.q);
  }

  @Get('location')
  @HttpCode(HttpStatus.OK)
  @ApiLocation()
  public async getLocation(
    @Query() queryParam: LatLonQueryDto,
  ): Promise<GeocodingResDto> {
    const latitude = parseFloat(queryParam.lat);
    const longitude = parseFloat(queryParam.lon);
    return this.service.handleGetLocation(latitude, longitude);
  }

  @Get('safe-route')
  @HttpCode(HttpStatus.OK)
  @ApiSafeRoute()
  public async getSafeRoute(
    @Query() queryParam: SafeRouteQueryDto,
  ): Promise<SafeRouteResDto> {
    return await this.service.handleGetSafeRoute(
      queryParam.startLatLon,
      queryParam.endLatLon,
    );
  }
}
