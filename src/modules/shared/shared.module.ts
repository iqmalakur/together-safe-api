import { Module } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma.service';
import { UploadService } from '../../infrastructures/upload.service';

@Module({
  providers: [PrismaService, UploadService],
  exports: [PrismaService, UploadService],
})
export class SharedModule {}
