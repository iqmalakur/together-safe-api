import { ApiProperty } from '@nestjs/swagger';

export class ErrorDto {
  @ApiProperty({ description: 'error message' })
  public readonly message: string;

  @ApiProperty({ description: 'error type' })
  public readonly error: string;

  @ApiProperty({ description: 'error status code' })
  public readonly statusCode: number;
}

export class ClientErrorDto {
  @ApiProperty({ description: 'error message', isArray: true })
  public readonly message: string[];

  @ApiProperty({ description: 'error type' })
  public readonly error: string;

  @ApiProperty({ description: 'error status code' })
  public readonly statusCode: number;
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

export class SuccessCreateDto {
  @ApiProperty({ description: 'success message' })
  message: string;

  @ApiProperty({ description: 'resource id' })
  id: string | number;
}
