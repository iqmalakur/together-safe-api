import { ApiProperty } from '@nestjs/swagger';

class BaseErrorDto {
  @ApiProperty({ description: 'error type' })
  error: string;

  @ApiProperty({ description: 'error status code' })
  statusCode: number;
}

export class ErrorDto extends BaseErrorDto {
  @ApiProperty({ description: 'error message' })
  message: string;
}

export class ClientErrorDto extends BaseErrorDto {
  @ApiProperty({ description: 'error messages' })
  message: string[];
}

export class ServerErrorDto extends BaseErrorDto {
  @ApiProperty({
    description: 'error message',
    example: 'Internal Server Error',
  })
  message: string;
}

export class SuccessCreateDto {
  @ApiProperty({ description: 'success message' })
  message: string;

  @ApiProperty({ description: 'resource id' })
  id: string | number;
}
