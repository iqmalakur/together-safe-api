import { LoggerUtil } from '../../utils/logger.util';

export abstract class BaseController {
  protected readonly logger: LoggerUtil;
  public constructor() {
    this.logger = new LoggerUtil(this.constructor.name);
  }
}
