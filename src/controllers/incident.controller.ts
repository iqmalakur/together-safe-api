import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { IncidentService } from '../services/incident.service';
import { IncidentResBody } from '../dto/incident.dto';
import { ApiIncident } from '../decorators/api-incident.decorator';

@Controller('incident')
@ApiTags('Incident')
export class IncidentController extends BaseController {
  public constructor(private readonly service: IncidentService) {
    super();
  }

  @Get()
  @ApiIncident()
  public async getIncident(): Promise<IncidentResBody[]> {
    return await this.service.handleGetIncident();
  }
}
