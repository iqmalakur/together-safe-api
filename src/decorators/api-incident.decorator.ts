import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiToken } from './api-token.decorator';
import { IncidentResDto } from '../modules/incident/incident.dto';
import { ServerErrorDto } from '../modules/shared/api-error.dto';

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
    ApiResponse({
      status: 500,
      description: 'an unexpected error occurred',
      type: ServerErrorDto,
    }),
  );
};
