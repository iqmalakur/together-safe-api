import { LoggerUtil } from './logger.util';

describe('logger utility test', () => {
  const classname = 'TestClass';
  const dataObject = { key: 'value' };
  const logger = {
    debug: jest.fn(),
    silly: jest.fn(),
    http: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  };

  let loggerUtil: LoggerUtil;

  beforeAll(() => {
    loggerUtil = new LoggerUtil(classname);
    (LoggerUtil as any).logger = logger;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return logger instance', () => {
    const loggerInstance = LoggerUtil.getInstance(classname);
    expect(loggerInstance).toBeInstanceOf(LoggerUtil);
    expect((loggerInstance as any).classname).toBe(classname);
  });

  it('should log debug message correctly', () => {
    const message = 'Debug message';

    loggerUtil.debug(message, dataObject);
    expect(logger.debug).toHaveBeenCalledWith(
      `${message}{\n  "key": "value"\n}`,
      { classname },
    );

    loggerUtil.debug(message);
    expect(logger.debug).toHaveBeenCalledWith(message, { classname });

    loggerUtil.debug(message, 'invalid json');
    expect(logger.debug).toHaveBeenCalledWith(message + 'invalid json', {
      classname,
    });
  });

  it('should log silly message correctly', () => {
    const message = 'Silly message';

    loggerUtil.silly(message, dataObject);
    expect(logger.silly).toHaveBeenCalledWith(
      `${message}{\n  "key": "value"\n}`,
      { classname },
    );

    loggerUtil.silly(message);
    expect(logger.silly).toHaveBeenCalledWith(message, { classname });

    loggerUtil.silly(message, 'invalid json');
    expect(logger.silly).toHaveBeenCalledWith(message + 'invalid json', {
      classname,
    });
  });

  it('should log info message correctly', () => {
    const message = 'Info message';
    loggerUtil.info(message);
    expect(logger.info).toHaveBeenCalledWith(message, { classname });
  });

  it('should log http message correctly', () => {
    const message = 'HTTP message';
    loggerUtil.http(message);
    expect(logger.http).toHaveBeenCalledWith(message, { classname });
  });

  it('should log error stack correctly', () => {
    const error = new Error('Test error');
    loggerUtil.error(error);
    expect(logger.error).toHaveBeenCalledWith(error.stack, { classname });
  });

  it('should format log data correctly as JSON', () => {
    const data = { key: 'value' };
    const formattedData = (loggerUtil as any).logFormat(data);
    expect(formattedData).toBe('{\n  "key": "value"\n}');
  });

  it('should return string data when logFormat is called with string', () => {
    const data = 'string data';
    const formattedData = (loggerUtil as any).logFormat(data);
    expect(formattedData).toBe('string data');
  });

  it('should return string if JSON.parse fails in logFormat', () => {
    const data = '{ invalid json }';
    const formattedData = (loggerUtil as any).logFormat(data);
    expect(formattedData).toBe(data);
  });

  it('should return return log data with censored token and password', () => {
    let data: any = { nik: '12345', name: 'ucup' };
    let formattedData = (loggerUtil as any).logFormat(data);
    let expectedResult = JSON.stringify(data, null, 2);
    expect(formattedData).toBe(expectedResult);

    data = { nik: '12345', name: 'ucup', password: 'admin$1234' };
    formattedData = (loggerUtil as any).logFormat(data);
    expectedResult = JSON.stringify({ ...data, password: '[hidden]' }, null, 2);
    expect(formattedData).toBe(expectedResult);

    data = { token: 'klsadfjoinvwekureong' };
    formattedData = (loggerUtil as any).logFormat(data);
    expectedResult = JSON.stringify({ ...data, token: '[hidden]' }, null, 2);
    expect(formattedData).toBe(expectedResult);

    data = {
      nik: '12345',
      name: 'ucup',
      password: 'admin$1234',
      token: 'klsadfjoinvwekureong',
    };
    formattedData = (loggerUtil as any).logFormat(data);
    expectedResult = JSON.stringify(
      { ...data, password: '[hidden]', token: '[hidden]' },
      null,
      2,
    );
    expect(formattedData).toBe(expectedResult);

    data = {
      routes: [
        [
          [107.5262377, -6.8869031],
          [107.5262283, -6.8866081],
        ],
        [
          [107.5262377, -6.8869031],
          [107.5262283, -6.8866081],
        ],
        [
          [107.5262377, -6.8869031],
          [107.5262283, -6.8866081],
        ],
      ],
    };
    formattedData = (loggerUtil as any).logFormat(data);
    expectedResult = JSON.stringify(
      {
        routes: [
          [
            [107.5262377, -6.8869031],
            [107.5262283, -6.8866081],
          ],
          '...',
          [
            [107.5262377, -6.8869031],
            [107.5262283, -6.8866081],
          ],
        ],
      },
      null,
      2,
    );
    expect(formattedData).toBe(expectedResult);
  });
});
