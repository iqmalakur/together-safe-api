import { Module } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma.service';
import { UploadService } from '../../infrastructures/upload.service';
import { ApiService } from 'src/infrastructures/api.service';

@Module({
  providers: [PrismaService, UploadService, ApiService],
  exports: [PrismaService, UploadService, ApiService],
})
export class SharedModule {}
