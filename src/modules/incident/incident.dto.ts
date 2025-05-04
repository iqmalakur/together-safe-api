import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { ReportItemDto } from '../report/report.dto';

export class IncidentResDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  public id: string;

  @ApiProperty({ example: 'Pembegalan' })
  public category: string;

  @ApiProperty({ example: 'high' })
  public riskLevel: string;

  @ApiProperty({ example: -6.884352875225879 })
  public latitude: number;

  @ApiProperty({ example: 107.52420901126096 })
  public longitude: number;

  @ApiProperty({
    example:
      'Jalan Warung Contong, Setiamanah, Cimahi, Jawa Barat, Jawa, 40524, Indonesia',
  })
  public location: string;

  @ApiProperty({ example: '19 Februari 2025' })
  public date: string;

  @ApiProperty({ example: '20:00' })
  public time: string;

  @ApiProperty({ example: 'active' })
  public status: string;

  @ApiProperty({ example: 10 })
  public radius: number;
}

export class IncidentDetailResDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  public id: string;

  @ApiProperty({ example: 'Pembegalan' })
  public category: string;

  @ApiProperty({ example: 'high' })
  public riskLevel: string;

  @ApiProperty({
    example:
      'Jalan Warung Contong, Setiamanah, Cimahi, Jawa Barat, Jawa, 40524, Indonesia',
  })
  public location: string;

  @ApiProperty({ example: '19 Februari 2025' })
  public date: string;

  @ApiProperty({ example: '20:00' })
  public time: string;

  @ApiProperty({ example: 'active' })
  public status: string;

  @ApiProperty({
    example: ['https://example.com/image.jpg', 'https://example.com/video.mp4'],
  })
  public mediaUrls: string[];

  @ApiProperty({
    description: 'Incident report',
    type: ReportItemDto,
    isArray: true,
  })
  public reports: ReportItemDto[];
}

export class IncidentParamDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'incident id',
  })
  @IsUUID(4, { message: 'id tidak valid' })
  public readonly id: string;
}

export class CategoryResDto {
  @ApiProperty({ example: 1 })
  public id: number;

  @ApiProperty({ example: 'Pembegalan' })
  public name: string;
}
