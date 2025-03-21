import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { LoggerUtil } from './logger.util';
import { JwtPayload } from '../modules/auth/auth.type';
import {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
  verify,
} from 'jsonwebtoken';
import { SECRET_KEY } from '../config/app.config';

export const handleError = (error: Error, logger: LoggerUtil) => {
  if (error instanceof HttpException) {
    throw error;
  }

  logger.error(error);
  throw new InternalServerErrorException();
};

const expectedErrors = new Set([
  JsonWebTokenError,
  TokenExpiredError,
  NotBeforeError,
  SyntaxError,
]);

export const validateToken = (token: string): JwtPayload | null => {
  try {
    return verify(token, SECRET_KEY) as JwtPayload;
  } catch (err) {
    if (!expectedErrors.has(err.constructor)) {
      handleError(err, LoggerUtil.getInstance('ValidateToken'));
    }

    return null;
  }
};

export const getPhotoUrl = (id: string) => {
  return `https://lh3.googleusercontent.com/d/${id}=s220`;
};
