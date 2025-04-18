import { Injectable } from '@nestjs/common';
import { LoggerUtil } from '../../utils/logger.util';

@Injectable()
export abstract class BaseService {
  protected readonly logger: LoggerUtil;

  public constructor() {
    this.logger = new LoggerUtil(this.constructor.name);
  }
}
