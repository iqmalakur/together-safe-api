import { Module } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class SharedModule {}
