import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, Matches } from 'class-validator';

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

export class ReportPreviewDto {
  @ApiProperty({ example: 'abcdefghijklmn' })
  public id: string;

  @ApiProperty({ example: 'Terjadi pembegalan di cimahi' })
  public description: string;
}

export class ReportParamDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'report id',
  })
  @IsUUID(4, { message: 'id tidak valid' })
  public readonly id: string;
}

class ReportUserDto {
  @ApiProperty({ example: 'John Marston' })
  public readonly name: string;

  @ApiProperty({
    example:
      'https://lh3.googleusercontent.com/d/22ZximVkuhxCuS_j_Vve2CKTyHiju0aY=s220',
  })
  public readonly profilePhoto: string | null;

  @ApiProperty({ example: 10 })
  public readonly reputation: number;
}

class CommentDto {
  @ApiProperty({ example: 1 })
  public readonly id: number;

  @ApiProperty({ example: 'Saya juga melihat kejadian ini' })
  public readonly comment: string;

  @ApiProperty({
    example: '2025-01-01T21:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  public readonly createdAt: Date;

  @ApiProperty({ example: false })
  public readonly isEdited: boolean;

  @ApiProperty({ type: ReportUserDto })
  public readonly user: ReportUserDto;
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

  @ApiProperty({ type: CommentDto, isArray: true })
  public readonly comments: CommentDto[];

  @ApiProperty({ example: 12 })
  public readonly upvote: number;

  @ApiProperty({ example: 3 })
  public readonly downvote: number;
}
