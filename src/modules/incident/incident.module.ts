import { Module } from '@nestjs/common';
import { IncidentController } from './incident.controller';
import { IncidentRepository } from './incident.repository';
import { IncidentService } from './incident.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [IncidentController],
  providers: [IncidentRepository, IncidentService],
})
export class IncidentModule {}
