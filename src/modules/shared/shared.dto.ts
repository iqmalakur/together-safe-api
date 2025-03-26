import { ApiProperty } from '@nestjs/swagger';

export class ErrorDto {
  @ApiProperty({ description: 'error message' })
  message: Array<string>;

  @ApiProperty({ description: 'error type' })
  error: string;

  @ApiProperty({ description: 'error status code' })
  statusCode: number;
}

export class ServerErrorDto {
  @ApiProperty({
    description: 'error message',
    example: 'Internal Server Error',
  })
  message: string;

  @ApiProperty({ description: 'error status code', example: 500 })
  statusCode: number;
}
