import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiToken } from './api-token.decorator';
import { ApiNotFound } from './api-response.decorator';

export const ApiAttendance = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'get attendance',
      description: 'get attendance data for specific employee by nik',
    }),
    ApiToken(),
    ApiResponse({
      status: 200,
      description: 'success get attendance data',
      // type: AttendanceResBody,
    }),
    ApiResponse({
      status: 204,
      description: 'employees have not taken attendance',
    }),
    ApiNotFound('karyawan tidak ditemukan', 'employee not found'),
    ApiResponse({
      status: 500,
      description: 'an unexpected error occurred',
      // type: ServerErrorResBody,
    }),
  );
};
