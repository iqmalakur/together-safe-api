import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiBadRequest, ApiServerError } from './api-response.decorator';
import { GeolocationResDto } from 'src/modules/geolocation/geolocation.dto';

export const ApiSearch = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'search locations',
      description: 'search locations based on query keyword',
    }),
    ApiResponse({
      status: 200,
      description: 'search result',
      type: GeolocationResDto,
      isArray: true,
    }),
    ApiBadRequest(
      "query parameter 'q' wajib diisi sebagai query pencarian",
      'missing or invalid search query',
    ),
    ApiServerError(),
  );
};
