import { ApiProperty } from '@nestjs/swagger';
import {
  IsBooleanString,
  IsNotEmpty,
  IsNumberString,
  IsUUID,
  Matches,
} from 'class-validator';
import {
  CommentResDto,
  ReportUserDto,
} from '../report-interaction/report-interaction.dto';

export class ReportReqDto {
  @ApiProperty({ description: '`1`: Pembegalan, `2`: Kecelakaan' })
  @IsNotEmpty({ message: 'Kategori ID tidak boleh kosong' })
  @IsNumberString({}, { message: 'Kategori ID tidak valid' })
  public readonly categoryId: string;

  @ApiProperty({ description: 'example: Terjadi pembegalan di Cimahi' })
  @IsNotEmpty({ message: 'Deskripsi tidak boleh kosong' })
  public readonly description: string;

  @ApiProperty({
    description: 'example: -6.8862571,107.5205219 (latitude,longitude)',
  })
  @IsNotEmpty({ message: 'Lokasi tidak boleh kosong' })
  @Matches(/^-?\d{1,2}\.\d+,-?\d{1,3}\.\d+$/, {
    message: 'Format lokasi harus `latitude,longitude`',
  })
  public readonly location: string;

  @ApiProperty({ description: 'example: 2025-01-01' })
  @IsNotEmpty({ message: 'Tanggal tidak boleh kosong' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Format tanggal harus YYYY-MM-DD',
  })
  public readonly date: string;

  @ApiProperty({ description: 'example: 21:30' })
  @IsNotEmpty({ message: 'Waktu tidak boleh kosong' })
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'Format waktu harus HH:mm',
  })
  public readonly time: string;

  @ApiProperty({ description: 'example: false' })
  @IsNotEmpty({ message: 'IsAnonymous tidak boleh kosong' })
  @IsBooleanString({ message: 'IsAnonymous tidak valid' })
  public readonly isAnonymous: string;

  @ApiProperty({
    description: 'Media (multiple file)',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  public readonly media: Array<Express.Multer.File>;
}

export class ReportItemDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  public readonly id: string;

  @ApiProperty({ example: 'Terjadi pembegalan di Cimahi' })
  public readonly description: string;

  @ApiProperty({ example: '2025-01-01' })
  public readonly date: string;

  @ApiProperty({ example: '21:30' })
  public readonly time: string;

  @ApiProperty({ example: 'crowdsourced' })
  public readonly status: string;

  @ApiProperty({ example: 'Pembegalan' })
  public readonly category: string;

  @ApiProperty({
    example:
      'Jalan Warung Contong, Setiamanah, Cimahi, Jawa Barat, Jawa, 40524, Indonesia',
  })
  public readonly location: string;
}

export class ReportParamDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Report ID',
  })
  @IsUUID(4, { message: 'ID tidak valid' })
  public readonly id: string;
}

export class IncidentDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  public readonly id: string;

  @ApiProperty({ example: 'Pembegalan' })
  public readonly category: string;
}

export class ReportResDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  public readonly id: string;

  @ApiProperty({ type: IncidentDto })
  public readonly incident: IncidentDto;

  @ApiProperty({ type: ReportUserDto })
  public readonly user: ReportUserDto;

  @ApiProperty({ example: false })
  public readonly isAnonymous: boolean;

  @ApiProperty({ example: 'Terjadi pembegalan motor di Cimahi' })
  public readonly description: string;

  @ApiProperty({ example: '2025-01-01' })
  public readonly date: string;

  @ApiProperty({ example: '21:30' })
  public readonly time: string;

  @ApiProperty({ example: 'verified' })
  public readonly status: string;

  @ApiProperty({
    example:
      'Jalan Warung Contong, Setiamanah, Cimahi, Jawa Barat, Jawa, 40524, Indonesia',
  })
  public readonly location: string;

  @ApiProperty({ example: -6.87245 })
  public readonly latitude: number;

  @ApiProperty({ example: 107.54287 })
  public readonly longitude: number;

  @ApiProperty({
    example:
      'https://lh3.googleusercontent.com/d/22ZximVkuhxCuS_j_Vve2CKTyHiju0aY=s220',
    isArray: true,
  })
  public readonly attachments: string[];

  @ApiProperty({ type: CommentResDto, isArray: true })
  public readonly comments: CommentResDto[];

  @ApiProperty({ example: 12 })
  public readonly upvote: number;

  @ApiProperty({ example: 3 })
  public readonly downvote: number;
}
