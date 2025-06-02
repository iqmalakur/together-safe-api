import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ApiBadRequest,
  ApiConflict,
  ApiNotFound,
  ApiServerError,
  ApiUnauthorized,
} from './api-response.decorator';
import {
  CommentResDto,
  VoteResDto,
} from '../modules/report-interaction/report-interaction.dto';

export const ApiUserVote = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user vote on a report',
      description:
        'Retrieve the vote submitted by the authenticated user for a specific report',
    }),
    ApiResponse({
      status: 200,
      description: 'User vote retrieved successfully',
      type: VoteResDto,
    }),
    ApiUnauthorized('Token tidak valid', 'Token is not valid'),
    ApiBadRequest(
      'ID laporan tidak valid',
      'Token is missing or reportId is invalid',
    ),
    ApiNotFound('Laporan tidak ditemukan', 'Report not found'),
    ApiServerError(),
  );
};

export const ApiVote = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Vote on a report',
      description: 'Allow the authenticated user to vote on a specific report',
    }),
    ApiResponse({
      status: 200,
      description: 'Vote successfully recorded',
      type: VoteResDto,
    }),
    ApiUnauthorized('Token tidak valid', 'Token is not valid'),
    ApiBadRequest('Tipe vote tidak valid', 'Invalid vote type or report ID'),
    ApiConflict(
      'Anda tidak dapat melakukan vote pada laporan Anda',
      'Self vote',
    ),
    ApiServerError(),
  );
};

export const ApiComment = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Post a comment on a report',
      description:
        'Allow the authenticated user to post a comment on a specific report',
    }),
    ApiResponse({
      status: 201,
      description: 'Comment successfully posted',
      type: CommentResDto,
    }),
    ApiUnauthorized('Token tidak valid', 'Token is not valid'),
    ApiBadRequest(
      'Komentar tidak boleh kosong',
      'Invalid comment format or report ID',
    ),
    ApiServerError(),
  );
};

export const ApiUpdateComment = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Update a comment on a report',
      description:
        'Allow the authenticated user to update a comment on a specific report',
    }),
    ApiResponse({
      status: 200,
      description: 'Comment successfully updated',
      type: CommentResDto,
    }),
    ApiUnauthorized('Token tidak valid', 'Token is not valid'),
    ApiBadRequest(
      'Komentar tidak boleh kosong',
      'Invalid comment format or report ID',
    ),
    ApiNotFound(
      'Komentar tidak ditemukan atau Anda tidak memiliki komentar ini',
      'The comment was not found or is not owned by the user',
    ),
    ApiServerError(),
  );
};

export const ApiDeleteComment = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete a comment from a report',
      description:
        'Allow the authenticated user to delete a specific comment from a report',
    }),
    ApiResponse({
      status: 200,
      description: 'Comment successfully deleted',
      type: CommentResDto,
    }),
    ApiUnauthorized('Token tidak valid', 'Token is not valid'),
    ApiBadRequest('ID komentar tidak valid', 'Invalid report ID'),
    ApiNotFound(
      'Komentar tidak ditemukan atau Anda tidak memiliki komentar ini',
      'The comment was not found or is not owned by the user',
    ),
    ApiServerError(),
  );
};
