import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../shared/base.controller';
import { IncidentService } from './incident.service';
import {
  IncidentDetailResDto,
  IncidentParamDto,
  IncidentQueryDto,
  IncidentResDto,
} from './incident.dto';
import {
  ApiIncident,
  ApiIncidentReport,
} from '../../decorators/api-incident.decorator';
import { ReportPreviewDto } from '../report/report.dto';

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

  @Get(':id')
  // @ApiIncidentDetail()
  public async getIncidentDetail(
    @Param() param: IncidentParamDto,
  ): Promise<IncidentDetailResDto> {
    return await this.service.handleGetIncidentDetail(param.id);
  }

  @Get(':id/reports')
  @ApiIncidentReport()
  public async getIncidentReports(
    @Param() param: IncidentParamDto,
  ): Promise<ReportPreviewDto[]> {
    return await this.service.handleGetIncidentReports(param.id);
  }
}
