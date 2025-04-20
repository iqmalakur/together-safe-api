import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoggerUtil } from '../utils/logger.util';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger: LoggerUtil;

  public constructor() {
    super();
    this.logger = new LoggerUtil(this.constructor.name);
  }

  public async onModuleInit() {
    await this.$connect();
    this.logger.info('Database is connected');
  }

  public async onModuleDestroy() {
    await this.$disconnect();
    this.logger.info('Database is disconnected');
  }
}
