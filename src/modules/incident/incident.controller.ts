import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IncidentService } from './incident.service';
import {
  CategoryResDto,
  IncidentDetailResDto,
  IncidentParamDto,
  IncidentResDto,
} from './incident.dto';
import {
  ApiCategories,
  ApiIncident,
  ApiIncidentDetail,
  ApiIncidentReport,
} from '../../decorators/api-incident.decorator';
import { ReportItemDto } from '../report/report.dto';
import { AbstractLogger } from '../shared/abstract-logger';
import { LatLonQueryDto } from '../geolocation/geolocation.dto';

@Controller('incident')
@ApiTags('Incident')
export class IncidentController extends AbstractLogger {
  public constructor(private readonly service: IncidentService) {
    super();
  }

  @Get()
  @ApiIncident()
  public async getNearbyIncident(
    @Query() query: LatLonQueryDto,
  ): Promise<IncidentResDto[]> {
    const latitude = parseFloat(query.lat);
    const longitude = parseFloat(query.lon);

    return await this.service.handleGetNearbyIncident(latitude, longitude);
  }

  @Get('categories')
  @ApiCategories()
  public async getCategories(): Promise<CategoryResDto[]> {
    return await this.service.handleGetCategories();
  }

  @Get(':id')
  @ApiIncidentDetail()
  public async getIncidentDetail(
    @Param() param: IncidentParamDto,
  ): Promise<IncidentDetailResDto> {
    return await this.service.handleGetIncidentDetail(param.id);
  }

  @Get(':id/reports')
  @ApiIncidentReport()
  public async getIncidentReports(
    @Param() param: IncidentParamDto,
  ): Promise<ReportItemDto[]> {
    return await this.service.handleGetIncidentReports(param.id);
  }
}
