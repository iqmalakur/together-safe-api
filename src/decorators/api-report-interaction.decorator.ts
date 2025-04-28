import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ApiBadRequest,
  ApiNotFound,
  ApiServerError,
  ApiUnauthorized,
} from './api-response.decorator';
import {
  CommentResDto,
  VoteResDto,
} from 'src/modules/report-interaction/report-interaction.dto';

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

export const ApiComment = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'post a comment on a report',
      description:
        'allow the authenticated user to post a comment on a specific report.',
    }),
    ApiResponse({
      status: 201,
      description: 'comment successfully posted',
      type: CommentResDto,
    }),
    ApiUnauthorized('token tidak valid', 'token is not valid'),
    ApiBadRequest(
      'komentar tidak boleh kosong',
      'invalid comment format or report id',
    ),
    ApiServerError(),
  );
};

export const ApiDeleteComment = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'delete a comment from a report',
      description:
        'allow the authenticated user to delete a specific comment from a report.',
    }),
    ApiResponse({
      status: 200,
      description: 'comment successfully deleted',
      type: CommentResDto,
    }),
    ApiUnauthorized('token tidak valid', 'token is not valid'),
    ApiBadRequest(
      'token harus diisi',
      'token is not provided or not in a valid format',
    ),
    ApiNotFound(
      'komentar tidak ditemukan atau Anda tidak memiliki komentar ini',
      'the comment was not found or is not owned by the user',
    ),
    ApiServerError(),
  );
};
