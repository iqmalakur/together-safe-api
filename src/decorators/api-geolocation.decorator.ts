import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiBadRequest, ApiServerError } from './api-response.decorator';
import {
  GeocodingResDto,
  SafeRouteResDto,
} from 'src/modules/geolocation/geolocation.dto';

export const ApiSearch = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'search locations',
      description: 'search locations based on query keyword',
    }),
    ApiResponse({
      status: 200,
      description: 'search result',
      type: GeocodingResDto,
      isArray: true,
    }),
    ApiBadRequest(
      "query parameter 'q' wajib diisi sebagai query pencarian",
      'missing or invalid search query',
    ),
    ApiServerError(),
  );
};

export const ApiSafeRoute = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'get safe route',
      description: 'get recommended safe route between two coordinates',
    }),
    ApiResponse({
      status: 200,
      description: 'safe route result',
      type: SafeRouteResDto,
    }),
    ApiBadRequest(
      "query parameter 'startLatLon' wajib diisi sebagai lokasi awal",
      'missing or invalid coordinates',
    ),
    ApiServerError(),
  );
};
