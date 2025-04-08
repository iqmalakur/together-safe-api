import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiBadRequest, ApiConflict } from './api-response.decorator';
import { ReportResDto } from 'src/modules/report/report.dto';
import { ServerErrorDto } from 'src/modules/shared/shared.dto';

export const ApiPostReport = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'submit a new incident report',
      description: 'allows user to submit a new incident report.',
    }),
    ApiResponse({
      status: 201,
      description: 'report submitted successfully',
      type: ReportResDto,
    }),
    ApiBadRequest('deskripsi tidak boleh kosong', 'unfilled required fields'),
    ApiConflict('Laporan serupa telah kamu kirim hari ini', 'duplicate report'),
    ApiResponse({
      status: 500,
      description: 'an unexpected server error occurred',
      type: ServerErrorDto,
    }),
  );
};
