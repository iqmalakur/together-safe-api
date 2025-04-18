import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../shared/base.controller';
import { GeolocationService } from './geolocation.service';
import {
  GeoJSONFeatureDTO,
  GeocodingResDto,
  GeocodingQueryDto,
  SafeRouteQueryDto,
} from './geolocation.dto';
import { ApiSearch } from 'src/decorators/api-geolocation.decorator';

@Controller('geolocation')
@ApiTags('Geolocation')
export class GeolocationController extends BaseController {
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

  @Get('safe-route')
  @HttpCode(HttpStatus.OK)
  // @ApiSafeRoute()
  public async getSafeRoute(
    @Query() queryParam: SafeRouteQueryDto,
  ): Promise<GeoJSONFeatureDTO> {
    return await this.service.handleGetSafeRoute(
      queryParam.startLatLon,
      queryParam.endLatLon,
    );
  }
}
