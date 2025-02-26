import { ApiSecurity } from '@nestjs/swagger';
import { LoggerUtil } from '../utils/logger.util';

@ApiSecurity('jwt')
export abstract class BaseController {
  protected readonly logger: LoggerUtil;
  public constructor() {
    this.logger = new LoggerUtil(this.constructor.name);
  }
}
