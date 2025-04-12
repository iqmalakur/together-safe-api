import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiToken } from './api-token.decorator';
import { IncidentResDto } from '../modules/incident/incident.dto';
import { ApiServerError } from './api-response.decorator';
import { ReportPreviewDto } from 'src/modules/report/report.dto';

export const ApiIncident = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'get incident',
      description: 'get incident data',
    }),
    ApiToken(),
    ApiResponse({
      status: 200,
      description: 'success get incident data',
      type: IncidentResDto,
    }),
    ApiServerError(),
  );
};

export const ApiIncidentReport = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'get incident reports',
      description: 'get a list of incident reports.',
    }),
    ApiResponse({
      status: 200,
      description: 'List of incident reports successfully retrieved',
      type: ReportPreviewDto,
      isArray: true,
    }),
    ApiServerError(),
  );
};
