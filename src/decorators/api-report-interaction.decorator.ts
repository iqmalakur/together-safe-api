import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ApiBadRequest,
  ApiServerError,
  ApiUnauthorized,
} from './api-response.decorator';
import { VoteResDto } from 'src/modules/report-interaction/report-interaction.dto';

export const ApiVote = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'vote on a report',
      description: 'allow the authenticated user to vote on a specific report.',
    }),
    ApiResponse({
      status: 200,
      description: 'vote successfully recorded',
      type: VoteResDto,
    }),
    ApiUnauthorized('token tidak valid', 'token is not valid'),
    ApiBadRequest('tipe vote tidak valid', 'invalid vote type or report id'),
    ApiServerError(),
  );
};
