import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ServerErrorResBody } from '../modules/shared/api-error.dto';
import { ApiBadRequest, ApiUnauthorized } from './api-response.decorator';
import { LoginResDto } from 'src/modules/auth/auth.dto';

export const ApiLogin = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'perform login',
      description: 'perform user login and get a jwt token',
    }),
    ApiResponse({
      status: 200,
      description: 'login successful',
      type: LoginResDto,
    }),
    ApiBadRequest('email harus diisi!', 'unfilled email or password'),
    ApiUnauthorized('email atau password salah!', 'invalid email or password'),
    ApiResponse({
      status: 500,
      description: 'an unexpected error occurred',
      type: ServerErrorResBody,
    }),
  );
};
