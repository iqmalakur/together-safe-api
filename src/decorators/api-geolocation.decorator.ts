import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiBadRequest, ApiServerError } from './api-response.decorator';
import {
  GeocodingResDto,
  SafeRouteResDto,
} from '../modules/geolocation/geolocation.dto';

export const ApiSearch = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Search locations',
      description: 'Search locations based on query keyword',
    }),
    ApiResponse({
      status: 200,
      description: 'Search result',
      type: GeocodingResDto,
      isArray: true,
    }),
    ApiBadRequest(
      "Query parameter 'q' wajib diisi sebagai query pencarian",
      'Missing or invalid search query',
    ),
    ApiServerError(),
  );
};

export const ApiLocation = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get location detail',
      description: 'Get location information based on latitude and longitude',
    }),
    ApiResponse({
      status: 200,
      description: 'Location result',
      type: GeocodingResDto,
    }),
    ApiBadRequest(
      'Latitude tidak valid',
      'Missing or invalid latitude/longitude',
    ),
    ApiServerError(),
  );
};

export const ApiSafeRoute = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get safe route',
      description: 'Get recommended safe route between two coordinates',
    }),
    ApiResponse({
      status: 200,
      description: 'Safe route result',
      type: SafeRouteResDto,
    }),
    ApiBadRequest(
      "Query parameter 'startLatLon' wajib diisi sebagai lokasi awal",
      'Missing or invalid coordinates',
    ),
    ApiServerError(),
  );
};
