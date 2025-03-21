import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorDto } from '../modules/shared/shared.dto';

const createApiResponseDecorator = (
  status: number,
  error: string,
  description: string,
  message: string,
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
      type: ErrorDto,
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
    message,
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
