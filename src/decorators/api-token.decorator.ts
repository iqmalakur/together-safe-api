import { applyDecorators } from '@nestjs/common';
import { ApiBadRequest, ApiUnauthorized } from './api-response.decorator';

export const ApiToken = (): MethodDecorator => {
  return applyDecorators(
    ApiBadRequest('Token harus diisi', 'Token is required'),
    ApiUnauthorized('Token tidak valid', 'Invalid token'),
  );
};
