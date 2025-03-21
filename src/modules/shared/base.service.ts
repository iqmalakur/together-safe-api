import { Injectable } from '@nestjs/common';
import { LoggerUtil } from '../../utils/logger.util';

@Injectable()
export abstract class BaseService<TRepository> {
  protected readonly logger: LoggerUtil;

  public constructor(protected readonly repository: TRepository) {
    this.logger = new LoggerUtil(this.constructor.name);
  }
}
