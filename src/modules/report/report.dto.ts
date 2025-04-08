import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';

export class ReportUserDto {
  @ApiProperty({ example: 'john@example.com' })
  public readonly email: string;

  @ApiProperty({ example: 'John Marston' })
  public readonly name: string;

  @ApiProperty({
    example:
      'https://lh3.googleusercontent.com/d/22ZximVkuhxCuS_j_Vve2CKTyHiju0aY=s220',
  })
  public readonly profilePhoto: string | null;
}

export class ReportReqDto {
  @ApiProperty({ description: '`1`: Pembegalan, `2`: Kecelakaan' })
  @IsNotEmpty({ message: 'kategori id tidak boleh kosong' })
  public categoryId: number;

  @ApiProperty({ description: 'example: Terjadi pembegalan di Cimahi' })
  @IsNotEmpty({ message: 'deskripsi tidak boleh kosong' })
  public description: string;

  @ApiProperty({
    description: 'example: -6.8862571,107.5205219 (latitude,longitude)',
  })
  @IsNotEmpty({ message: 'lokasi tidak boleh kosong' })
  @Matches(/^-?\d{1,2}\.\d+,-?\d{1,3}\.\d+$/, {
    message: 'format lokasi harus latitude,longitude',
  })
  public location: string;

  @ApiProperty({ description: 'example: 2025-01-01' })
  @IsNotEmpty({ message: 'tanggal tidak boleh kosong' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'format tanggal harus YYYY-MM-DD',
  })
  public date: string;

  @ApiProperty({ description: 'example: 21:30' })
  @IsNotEmpty({ message: 'waktu tidak boleh kosong' })
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'format waktu harus HH:mm',
  })
  public time: string;

  @ApiProperty({
    description: 'media (multiple file)',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  public media: Array<Express.Multer.File>;
}

export class ReportResDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  public readonly id: string;

  @ApiProperty({ example: 'Terjadi pembegalan motor di Cimahi' })
  public readonly description: string;

  @ApiProperty({ example: '2025-01-01' })
  public readonly date: string;

  @ApiProperty({ example: '21:30' })
  public readonly time: string;

  @ApiProperty({ example: 'verified' })
  public readonly status: string;

  @ApiProperty({ description: 'user' })
  public readonly user: ReportUserDto;

  @ApiProperty({
    example:
      'Jalan Warung Contong, Setiamanah, Cimahi, Jawa Barat, Jawa, 40524, Indonesia',
  })
  public readonly location: string;

  @ApiProperty({
    example:
      'https://lh3.googleusercontent.com/d/22ZximVkuhxCuS_j_Vve2CKTyHiju0aY=s220',
    isArray: true,
  })
  public readonly attachments: string[];
}
