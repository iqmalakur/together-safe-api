import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { LoggerUtil } from './logger.util';
import { UserJwtPayload } from '../modules/shared/shared.type';
import {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
  verify,
} from 'jsonwebtoken';
import { SECRET_KEY } from '../config/app.config';

export const handleError = (error: Error, logger: LoggerUtil): Error => {
  if (error instanceof HttpException) {
    return error;
  }

  logger.error(error);
  return new InternalServerErrorException();
};

const expectedErrors = new Set([
  JsonWebTokenError,
  TokenExpiredError,
  NotBeforeError,
  SyntaxError,
]);

export const validateToken = (token: string): UserJwtPayload | null => {
  try {
    return verify(token, SECRET_KEY) as UserJwtPayload;
  } catch (err) {
    if (!expectedErrors.has(err.constructor)) {
      throw handleError(err, LoggerUtil.getInstance('ValidateToken'));
    }

    return null;
  }
};

export const getFileUrl = (id: string) => {
  return `https://drive.google.com/uc?export=view&id=${id}`;
};
