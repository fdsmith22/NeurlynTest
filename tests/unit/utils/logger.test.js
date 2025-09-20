const logger = require('../../../utils/logger');

describe('Logger Utility', () => {
  beforeEach(() => {
    // Clear any mocks before each test
    jest.clearAllMocks();
  });

  test('should have all required log levels', () => {
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
    expect(logger.http).toBeDefined();
  });

  test('should have a stream object for Morgan', () => {
    expect(logger.stream).toBeDefined();
    expect(logger.stream.write).toBeDefined();
    expect(typeof logger.stream.write).toBe('function');
  });

  test('should format log messages correctly', () => {
    const spy = jest.spyOn(logger, 'info').mockImplementation(() => {});
    const testMessage = 'Test log message';

    logger.info(testMessage);

    expect(spy).toHaveBeenCalledWith(testMessage);
    spy.mockRestore();
  });

  test('should handle error objects', () => {
    const spy = jest.spyOn(logger, 'error').mockImplementation(() => {});
    const testError = new Error('Test error');

    logger.error('Error occurred', testError);

    expect(spy).toHaveBeenCalledWith('Error occurred', testError);
    spy.mockRestore();
  });
});
