import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { Geometry } from './geolocation.type';

export class GeocodingQueryDto {
  @ApiProperty({ example: 'cimahi', description: 'search query' })
  @IsString({
    message: 'query parameter harus berupa teks',
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
    message: "query parameter 'startLatLon' wajib diisi sebagai lokasi awal",
  })
  @Matches(/^-?\d{1,2}\.\d+,-?\d{1,3}\.\d+$/, {
    message: 'format lokasi awal harus latitude,longitude',
  })
  public readonly startLatLon: string;

  @ApiProperty({
    example: '-6.8957819239869105,107.52016305919628',
    description: 'end location',
  })
  @IsNotEmpty({
    message: "query parameter 'endLatLon' wajib diisi sebagai lokasi akhir",
  })
  @Matches(/^-?\d{1,2}\.\d+,-?\d{1,3}\.\d+$/, {
    message: 'format lokasi akhir harus latitude,longitude',
  })
  public readonly endLatLon: string;
}

export class GeoJSONFeatureDTO {
  public readonly type: string;
  public readonly geometry: Geometry;
  public readonly properties: any;
}
