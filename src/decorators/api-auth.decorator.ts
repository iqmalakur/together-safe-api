import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ApiBadRequest,
  ApiConflict,
  ApiServerError,
  ApiUnauthorized,
} from './api-response.decorator';
import { AuthResDto } from '../modules/auth/auth.dto';
import { SuccessCreateDto } from 'src/modules/shared/shared.dto';

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
    ApiServerError(),
  );
};

export const ApiRegister = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'perform registration',
      description: 'register a new user',
    }),
    ApiResponse({
      status: 201,
      description: 'registration successful',
      type: SuccessCreateDto,
      example: {
        id: 'ucup@gmail.com',
        message: 'Pendaftaran pengguna berhasil',
      },
    }),
    ApiBadRequest(
      'email harus diisi!',
      'unfilled email or password or other required fields',
    ),
    ApiConflict('email sudah terdaftar!', 'email already registered'),
    ApiServerError(),
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
    ApiServerError(),
  );
};
