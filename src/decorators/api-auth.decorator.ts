import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ServerErrorDto } from '../modules/shared/shared.dto';
import { ApiBadRequest, ApiUnauthorized } from './api-response.decorator';
import { AuthResDto } from '../modules/auth/auth.dto';

export const ApiLogin = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'perform login',
      description: 'perform user login and get a jwt token',
    }),
    ApiResponse({
      status: 200,
      description: 'login successful',
      type: AuthResDto,
    }),
    ApiBadRequest('email harus diisi!', 'unfilled email or password'),
    ApiUnauthorized('email atau password salah!', 'invalid email or password'),
    ApiResponse({
      status: 500,
      description: 'an unexpected error occurred',
      type: ServerErrorDto,
    }),
  );
};

export const ApiValidateToken = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'validate token',
      description: 'validate the provided jwt token',
    }),
    ApiResponse({
      status: 200,
      description: 'token is valid',
      type: AuthResDto,
    }),
    ApiBadRequest('token harus diisi!', 'unfilled token'),
    ApiUnauthorized('token tidak valid!', 'invalid token'),
    ApiResponse({
      status: 500,
      description: 'an unexpected error occurred',
      type: ServerErrorDto,
    }),
  );
};
