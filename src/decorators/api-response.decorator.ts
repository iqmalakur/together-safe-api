import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import {
  ClientErrorDto,
  ErrorDto,
  ServerErrorDto,
} from '../modules/shared/shared.dto';

const createApiResponseDecorator = (
  status: number,
  error: string,
  description: string,
  message: string | string[],
  errorDto: Type = ErrorDto,
): MethodDecorator => {
  const example = {
    message,
    error,
    statusCode: status,
  };

  return applyDecorators(
    ApiResponse({
      status,
      description,
      type: errorDto,
      example,
    }),
  );
};

export const ApiBadRequest = (
  message: string,
  description: string = 'bad request',
): MethodDecorator =>
  createApiResponseDecorator(
    HttpStatus.BAD_REQUEST,
    'Bad Request',
    description,
    [message],
    ClientErrorDto,
  );

export const ApiUnauthorized = (
  message: string,
  description: string = 'unauthorized',
): MethodDecorator =>
  createApiResponseDecorator(
    HttpStatus.UNAUTHORIZED,
    'Unauthorized',
    description,
    message,
  );

export const ApiNotFound = (
  message: string,
  description: string = 'not found',
): MethodDecorator =>
  createApiResponseDecorator(
    HttpStatus.NOT_FOUND,
    'Not Found',
    description,
    message,
  );

export const ApiConflict = (
  message: string,
  description: string = 'conflict',
): MethodDecorator =>
  createApiResponseDecorator(
    HttpStatus.CONFLICT,
    'Conflict',
    description,
    message,
  );

export const ApiServerError = (): MethodDecorator =>
  ApiResponse({
    status: 500,
    description: 'an unexpected error occurred',
    type: ServerErrorDto,
  });
