import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiToken } from './api-token.decorator';
import { IncidentResBody } from '../dto/incident.dto';
import { ServerErrorResBody } from '../dto/api-error.dto';

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
      type: IncidentResBody,
    }),
    ApiResponse({
      status: 500,
      description: 'an unexpected error occurred',
      type: ServerErrorResBody,
    }),
  );
};
