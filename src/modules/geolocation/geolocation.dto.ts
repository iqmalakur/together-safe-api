import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class LatLonQueryDto {
  @ApiProperty({ example: '-6.9175' })
  @IsNotEmpty({ message: 'Latitude wajib diisi' })
  @Matches(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)+$/, {
    message: 'Latitude tidak valid',
  })
  public readonly lat: string;

  @ApiProperty({ example: '107.6191' })
  @IsNotEmpty({ message: 'Longitude wajib diisi' })
  @Matches(/^[-+]?((1[0-7]\d)|([1-9]?\d))(\.\d+)?$|^[-+]?180(\.0+)?$/, {
    message: 'Longitude tidak valid',
  })
  public readonly lon: string;
}

export class GeocodingQueryDto {
  @ApiProperty({ example: 'cimahi', description: 'search query' })
  @IsNotEmpty({
    message: "Query parameter 'q' wajib diisi sebagai query pencarian",
  })
  public readonly q: string;
}

export class GeocodingResDto {
  @ApiProperty({ example: 'Cimahi' })
  public readonly name: string;

  @ApiProperty({ example: 'Cimahi, Jawa Barat, Jawa, Indonesia' })
  public readonly fullName: string;

  @ApiProperty({ example: -6.8731527 })
  public readonly latitude: number;

  @ApiProperty({ example: 107.5423099 })
  public readonly longitude: number;
}

export class SafeRouteQueryDto {
  @ApiProperty({
    example: '-6.887301617466124,107.52252981811685',
    description: 'start location',
  })
  @IsNotEmpty({
    message: "Query parameter 'startLatLon' wajib diisi sebagai lokasi awal",
  })
  @Matches(/^-?\d{1,2}\.\d+,-?\d{1,3}\.\d+$/, {
    message: 'Format lokasi awal harus latitude,longitude',
  })
  public readonly startLatLon: string;

  @ApiProperty({
    example: '-6.8957819239869105,107.52016305919628',
    description: 'end location',
  })
  @IsNotEmpty({
    message: "Query parameter 'endLatLon' wajib diisi sebagai lokasi akhir",
  })
  @Matches(/^-?\d{1,2}\.\d+,-?\d{1,3}\.\d+$/, {
    message: 'Format lokasi akhir harus latitude,longitude',
  })
  public readonly endLatLon: string;
}

export class SafeRouteResDto {
  @ApiProperty({
    example: [
      [
        [107.5262377, -6.8869031],
        [107.5262283, -6.8866081],
      ],
    ],
  })
  public readonly routes: number[][][];
}
