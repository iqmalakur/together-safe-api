import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ApiBadRequest,
  ApiConflict,
  ApiServerError,
} from './api-response.decorator';
import { SuccessCreateDto } from 'src/modules/shared/shared.dto';

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
    ApiBadRequest('deskripsi tidak boleh kosong', 'unfilled required fields'),
    ApiConflict('Laporan serupa telah kamu kirim hari ini', 'duplicate report'),
    ApiServerError(),
  );
};
