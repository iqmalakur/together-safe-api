import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ApiBadRequest,
  ApiConflict,
  ApiServerError,
  ApiUnauthorized,
} from './api-response.decorator';
import { SuccessCreateDto } from 'src/modules/shared/shared.dto';
import { ReportItemDto, ReportResDto } from 'src/modules/report/report.dto';

export const ApiUserReport = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user reports',
      description: 'Get a list of reports submitted by the authenticated user',
    }),
    ApiResponse({
      status: 200,
      description: 'List of user reports successfully retrieved',
      type: ReportItemDto,
      isArray: true,
    }),
    ApiUnauthorized('Token tidak valid', 'Token is not valid'),
    ApiBadRequest(
      'Token harus diisi',
      'Token is not provided or not a valid format',
    ),
    ApiServerError(),
  );
};

export const ApiReport = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get a single report by ID',
      description: 'Retrieve a detailed report based on the provided report ID',
    }),
    ApiResponse({
      status: 200,
      description: 'Report data successfully retrieved',
      type: ReportResDto,
    }),
    ApiUnauthorized('Token tidak valid', 'Token is not valid'),
    ApiBadRequest('ID tidak valid', 'Invalid report ID format or bad token'),
    ApiServerError(),
  );
};

export const ApiPostReport = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Submit a new incident report',
      description: 'Allows user to submit a new incident report',
    }),
    ApiResponse({
      status: 201,
      description: 'Report submitted successfully',
      type: SuccessCreateDto,
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        message: 'Berhasil membuat laporan insiden',
      },
    }),
    ApiUnauthorized('Token tidak valid', 'Token is not valid'),
    ApiBadRequest('Deskripsi tidak boleh kosong', 'Unfilled required fields'),
    ApiConflict('Laporan serupa telah kamu kirim hari ini', 'Duplicate report'),
    ApiServerError(),
  );
};
