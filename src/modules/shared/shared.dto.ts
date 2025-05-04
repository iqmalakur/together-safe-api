import { ApiProperty } from '@nestjs/swagger';

export class ErrorDto {
  @ApiProperty({ description: 'Error message' })
  public readonly message: string;

  @ApiProperty({ description: 'Error type' })
  public readonly error: string;

  @ApiProperty({ description: 'HTTP status code' })
  public readonly statusCode: number;
}

export class ClientErrorDto {
  @ApiProperty({ description: 'Error message', isArray: true })
  public readonly message: string[];

  @ApiProperty({ description: 'Error type' })
  public readonly error: string;

  @ApiProperty({ description: 'HTTP status code' })
  public readonly statusCode: number;
}

export class ServerErrorDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Internal Server Error',
  })
  public readonly message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 500,
  })
  public readonly statusCode: number;
}

export class SuccessCreateDto {
  @ApiProperty({ description: 'Success message' })
  public readonly message: string;

  @ApiProperty({ description: 'Resource ID' })
  public readonly id: string | number;
}
