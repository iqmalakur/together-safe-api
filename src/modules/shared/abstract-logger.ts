import { LoggerUtil } from '../../utils/logger.util';

export abstract class AbstractLogger {
  protected readonly logger: LoggerUtil;
  public constructor() {
    this.logger = new LoggerUtil(this.constructor.name);
  }
}
