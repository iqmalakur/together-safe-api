import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../shared/base.controller';
import { IncidentService } from './incident.service';
import { IncidentQueryDto, IncidentResDto } from './incident.dto';
import { ApiIncident } from '../../decorators/api-incident.decorator';

@Controller('incident')
@ApiTags('Incident')
export class IncidentController extends BaseController {
  public constructor(private readonly service: IncidentService) {
    super();
  }

  @Get()
  @ApiIncident()
  public async getNearbyIncident(
    @Query() query: IncidentQueryDto,
  ): Promise<IncidentResDto[]> {
    const latitude = parseFloat(query.lat);
    const longitude = parseFloat(query.lon);

    return await this.service.handleGetNearbyIncident(latitude, longitude);
  }
}
