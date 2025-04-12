import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiToken } from './api-token.decorator';
import {
  IncidentDetailResDto,
  IncidentResDto,
} from '../modules/incident/incident.dto';
import {
  ApiBadRequest,
  ApiNotFound,
  ApiServerError,
} from './api-response.decorator';
import { ReportPreviewDto } from 'src/modules/report/report.dto';

export const ApiIncident = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'get incident',
      description: 'get incident data based on user location',
    }),
    ApiToken(),
    ApiResponse({
      status: 200,
      description: 'success get incidents',
      type: IncidentResDto,
      isArray: true,
    }),
    ApiBadRequest(
      'latitude tidak valid',
      'latitude or longitude are not valid or not provided',
    ),
    ApiServerError(),
  );
};

export const ApiIncidentDetail = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'get detail incident',
      description: 'get detail incident by incident id',
    }),
    ApiToken(),
    ApiResponse({
      status: 200,
      description: 'success get detail incident',
      type: IncidentDetailResDto,
    }),
    ApiNotFound('insiden tidak ditemukan', 'Incident does not exist'),
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
