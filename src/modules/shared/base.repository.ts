import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma.service';

@Injectable()
export abstract class BaseRepository {
  public constructor(protected readonly prisma: PrismaService) {}
}
