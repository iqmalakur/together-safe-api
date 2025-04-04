import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GeolocationSearchQueryDto {
  @ApiProperty({ example: 'cimahi', description: 'search query' })
  @IsNotEmpty({
    message: "query parameter 'q' wajib diisi sebagai query pencarian",
  })
  public readonly q: string;
}

export class GeolocationResDto {
  @ApiProperty({ example: 'Cimahi' })
  public readonly name: string;

  @ApiProperty({ example: 'Cimahi, Jawa Barat, Jawa, Indonesia' })
  public readonly fullName: string;

  @ApiProperty({ example: -6.8731527 })
  public readonly latitude: number;

  @ApiProperty({ example: 107.5423099 })
  public readonly longitude: number;
}
