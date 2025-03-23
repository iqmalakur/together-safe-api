import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma.service';
import { LoggerUtil } from '../../utils/logger.util';

@Injectable()
export abstract class BaseRepository {
  protected readonly logger: LoggerUtil;
  public constructor(protected readonly prisma: PrismaService) {
    this.logger = new LoggerUtil(this.constructor.name);
  }
}
