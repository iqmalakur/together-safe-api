import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { LoggerUtil } from './logger.util';

export const handleError = (error: Error, logger: LoggerUtil) => {
  if (error instanceof HttpException) {
    throw error;
  }

  logger.error(error);
  throw new InternalServerErrorException();
};
