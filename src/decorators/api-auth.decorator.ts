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
      summary: 'Perform login',
      description: 'Perform user login and get a JWT token',
    }),
    ApiResponse({
      status: 200,
      description: 'Login successful',
      type: AuthResDto,
    }),
    ApiBadRequest('Email harus diisi!', 'Unfilled email or password'),
    ApiUnauthorized('Email atau password salah!', 'Invalid email or password'),
    ApiServerError(),
  );
};

export const ApiRegister = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Perform registration',
      description: 'Register a new user',
    }),
    ApiResponse({
      status: 201,
      description: 'Registration successful',
      type: SuccessCreateDto,
      example: {
        id: 'ucup@gmail.com',
        message: 'Pendaftaran pengguna berhasil',
      },
    }),
    ApiBadRequest(
      'Email harus diisi!',
      'Unfilled email or password or other required fields',
    ),
    ApiConflict('Email sudah terdaftar!', 'Email already registered'),
    ApiServerError(),
  );
};

export const ApiValidateToken = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Validate token',
      description: 'Validate the provided JWT token',
    }),
    ApiResponse({
      status: 200,
      description: 'Token is valid',
      type: AuthResDto,
    }),
    ApiBadRequest('Token harus diisi!', 'Unfilled token'),
    ApiUnauthorized('Token tidak valid!', 'Invalid token'),
    ApiServerError(),
  );
};
