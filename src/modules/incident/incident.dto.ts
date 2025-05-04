import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { ReportItemDto } from '../report/report.dto';

export class IncidentResDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  public readonly id: string;

  @ApiProperty({ example: 'Pembegalan' })
  public readonly category: string;

  @ApiProperty({ example: 'high' })
  public readonly riskLevel: string;

  @ApiProperty({ example: -6.884352875225879 })
  public readonly latitude: number;

  @ApiProperty({ example: 107.52420901126096 })
  public readonly longitude: number;

  @ApiProperty({
    example:
      'Jalan Warung Contong, Setiamanah, Cimahi, Jawa Barat, Jawa, 40524, Indonesia',
  })
  public readonly location: string;

  @ApiProperty({ example: '19 Februari 2025' })
  public readonly date: string;

  @ApiProperty({ example: '20:00' })
  public readonly time: string;

  @ApiProperty({ example: 'active' })
  public readonly status: string;

  @ApiProperty({ example: 10 })
  public readonly radius: number;
}

export class IncidentDetailResDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  public readonly id: string;

  @ApiProperty({ example: 'Pembegalan' })
  public readonly category: string;

  @ApiProperty({ example: 'high' })
  public readonly riskLevel: string;

  @ApiProperty({
    example:
      'Jalan Warung Contong, Setiamanah, Cimahi, Jawa Barat, Jawa, 40524, Indonesia',
  })
  public readonly location: string;

  @ApiProperty({ example: '19 Februari 2025' })
  public readonly date: string;

  @ApiProperty({ example: '20:00' })
  public readonly time: string;

  @ApiProperty({ example: 'active' })
  public readonly status: string;

  @ApiProperty({
    example: ['https://example.com/image.jpg', 'https://example.com/video.mp4'],
  })
  public readonly mediaUrls: string[];

  @ApiProperty({
    description: 'Incident report',
    type: ReportItemDto,
    isArray: true,
  })
  public readonly reports: ReportItemDto[];
}

export class IncidentParamDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Incident ID',
  })
  @IsUUID(4, { message: 'ID tidak valid' })
  public readonly id: string;
}

export class CategoryResDto {
  @ApiProperty({ example: 1 })
  public readonly id: number;

  @ApiProperty({ example: 'Pembegalan' })
  public readonly name: string;
}
