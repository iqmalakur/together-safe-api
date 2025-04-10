import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ReportRepository } from './report.repository';

@Module({
  imports: [SharedModule],
  controllers: [ReportController],
  providers: [ReportService, ReportRepository],
})
export class ReportModule {}
