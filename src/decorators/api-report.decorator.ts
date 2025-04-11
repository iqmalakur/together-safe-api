import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ApiBadRequest,
  ApiConflict,
  ApiServerError,
  ApiUnauthorized,
} from './api-response.decorator';
import { SuccessCreateDto } from 'src/modules/shared/shared.dto';
import { ReportPreviewDto, ReportResDto } from 'src/modules/report/report.dto';

export const ApiUserReport = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'get user reports',
      description: 'get a list of reports submitted by the authenticated user.',
    }),
    ApiResponse({
      status: 200,
      description: 'List of user reports successfully retrieved',
      type: ReportPreviewDto,
      isArray: true,
    }),
    ApiUnauthorized('token tidak valid', 'token is not valid'),
    ApiBadRequest(
      'token harus diisi',
      'token is not provided or not a valid format',
    ),
    ApiServerError(),
  );
};

export const ApiReport = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'get a single report by ID',
      description:
        'retrieve a detailed report based on the provided report ID.',
    }),
    ApiResponse({
      status: 200,
      description: 'Report data successfully retrieved',
      type: ReportResDto,
    }),
    ApiUnauthorized('token tidak valid', 'token is not valid'),
    ApiBadRequest('id tidak valid', 'invalid report id format or bad token'),
    ApiServerError(),
  );
};

export const ApiPostReport = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'submit a new incident report',
      description: 'allows user to submit a new incident report.',
    }),
    ApiResponse({
      status: 201,
      description: 'report submitted successfully',
      type: SuccessCreateDto,
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        message: 'Berhasil membuat laporan insiden',
      },
    }),
    ApiUnauthorized('token tidak valid', 'token is not valid'),
    ApiBadRequest('deskripsi tidak boleh kosong', 'unfilled required fields'),
    ApiConflict('Laporan serupa telah kamu kirim hari ini', 'duplicate report'),
    ApiServerError(),
  );
};
