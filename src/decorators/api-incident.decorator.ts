import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  CategoryResDto,
  IncidentDetailResDto,
  IncidentResDto,
} from '../modules/incident/incident.dto';
import {
  ApiBadRequest,
  ApiNotFound,
  ApiServerError,
} from './api-response.decorator';
import { ReportItemDto } from '../modules/report/report.dto';

export const ApiIncident = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get incident',
      description: 'Get incident data based on user location',
    }),
    ApiResponse({
      status: 200,
      description: 'Success get incidents',
      type: IncidentResDto,
      isArray: true,
    }),
    ApiBadRequest(
      'Latitude tidak valid',
      'Latitude or longitude are not valid or not provided',
    ),
    ApiServerError(),
  );
};

export const ApiIncidentDetail = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get detail incident',
      description: 'Get detail incident by incident ID',
    }),
    ApiResponse({
      status: 200,
      description: 'Success get detail incident',
      type: IncidentDetailResDto,
    }),
    ApiNotFound('Insiden tidak ditemukan', 'Incident does not exist'),
    ApiServerError(),
  );
};

export const ApiIncidentReport = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get incident reports',
      description: 'Get a list of incident reports',
    }),
    ApiResponse({
      status: 200,
      description: 'List of incident reports successfully retrieved',
      type: ReportItemDto,
      isArray: true,
    }),
    ApiNotFound('Insiden tidak ditemukan', 'Incident does not exist'),
    ApiServerError(),
  );
};

export const ApiCategories = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all incident categories',
      description: 'Retrieve a list of all incident categories',
    }),
    ApiResponse({
      status: 200,
      description: 'List of incident categories successfully retrieved',
      type: CategoryResDto,
      isArray: true,
    }),
    ApiServerError(),
  );
};
