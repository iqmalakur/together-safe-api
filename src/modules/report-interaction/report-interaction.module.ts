import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { ReportInteractionController } from './report-interaction.controller';
import { ReportInteractionService } from './report-interaction.service';
import { ReportInteractionRepository } from './report-interaction.repository';

@Module({
  imports: [SharedModule],
  controllers: [ReportInteractionController],
  providers: [ReportInteractionService, ReportInteractionRepository],
})
export class ReportInteractionModule {}
