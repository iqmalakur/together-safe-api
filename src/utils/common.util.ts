import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { LoggerUtil } from './logger.util';
import { JwtPayload } from '../modules/auth/auth.type';
import {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
  verify,
} from 'jsonwebtoken';
import { APP_URL, SECRET_KEY } from '../config/app.config';

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

export const validateToken = (token: string): JwtPayload | null => {
  try {
    return verify(token, SECRET_KEY) as JwtPayload;
  } catch (err) {
    if (!expectedErrors.has(err.constructor)) {
      throw handleError(err, LoggerUtil.getInstance('ValidateToken'));
    }

    return null;
  }
};

const LOCAL_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.mp4', '.mkv', '.webp'];

export const getFileUrl = (
  filename: string,
  type: 'profiles' | 'incidents',
) => {
  const isLocal = LOCAL_EXTENSIONS.some((ext) =>
    filename.toLowerCase().endsWith(ext),
  );

  return isLocal
    ? `${APP_URL}/upload/${type}/${filename}`
    : `https://lh3.googleusercontent.com/d/${filename}=s220`;
};
