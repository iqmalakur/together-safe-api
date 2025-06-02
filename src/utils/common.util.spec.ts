import { HttpException, InternalServerErrorException } from '@nestjs/common';
import {
  getFileUrl,
  getFileUrlOrNull,
  handleError,
  validateToken,
} from './common.util';
import { LoggerUtil } from './logger.util';
import { sign } from 'jsonwebtoken';
import { SECRET_KEY } from '../config/app.config';

describe('common utility test', () => {
  const logger = {
    debug: jest.fn(),
    silly: jest.fn(),
    http: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  };
  let loggerUtil: LoggerUtil;

  beforeAll(() => {
    loggerUtil = new LoggerUtil('TestClass');
    (LoggerUtil as any).logger = logger;
  });

  it('should return same HttpException or wrap error in InternalServerErrorException', () => {
    const httpError = new HttpException('Bad Request', 400);
    const genericError = new Error('Something went wrong');

    expect(handleError(httpError, loggerUtil)).toBe(httpError);
    const result = handleError(genericError, loggerUtil);
    expect(result).toBeInstanceOf(InternalServerErrorException);
    expect(logger.error).toHaveBeenCalledWith(genericError.stack!, {
      classname: 'TestClass',
    });
  });

  it('should return payload if token is valid, null if common error, and throw if unexpected', () => {
    const validPayload = { userId: 1 };
    const validToken = sign(validPayload, SECRET_KEY);

    expect(validateToken(validToken)).toMatchObject(validPayload);

    const invalidToken = 'invalid.token.value';
    expect(validateToken(invalidToken)).toBeNull();

    class UnexpectedError extends Error {}
    const brokenVerify = () => {
      throw new UnexpectedError('unexpected');
    };

    const originalVerify = require('jsonwebtoken').verify;
    require('jsonwebtoken').verify = brokenVerify;

    const spy = jest
      .spyOn(LoggerUtil, 'getInstance')
      .mockReturnValue(loggerUtil);

    expect(() => validateToken('any')).toThrow(InternalServerErrorException);
    expect(logger.error).toHaveBeenCalled();

    // restore
    require('jsonwebtoken').verify = originalVerify;
    spy.mockRestore();
  });

  it('should return a correct google drive url', () => {
    expect(getFileUrl('abc123')).toBe(
      'https://drive.google.com/uc?export=view&id=abc123',
    );
    expect(getFileUrl('xyz')).toBe(
      'https://drive.google.com/uc?export=view&id=xyz',
    );
  });

  it('should return correct url or null', () => {
    expect(getFileUrlOrNull('file456')).toBe(
      'https://drive.google.com/uc?export=view&id=file456',
    );
    expect(getFileUrlOrNull(null)).toBeNull();
    expect(getFileUrlOrNull()).toBeNull();
  });
});
