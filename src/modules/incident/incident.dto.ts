import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, Matches } from 'class-validator';
import { ReportPreviewDto } from '../report/report.dto';

export class IncidentQueryDto {
  @ApiProperty({ example: '-6.9175' })
  @IsNotEmpty({ message: 'latitude wajib diisi' })
  @Matches(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)+$/, {
    message: 'latitude tidak valid',
  })
  public lat: string;

  @ApiProperty({ example: '107.6191' })
  @IsNotEmpty({ message: 'longitude wajib diisi' })
  @Matches(/^[-+]?((1[0-7]\d)|([1-9]?\d))(\.\d+)?$|^[-+]?180(\.0+)?$/, {
    message: 'longitude tidak valid',
  })
  public lon: string;
}

export class IncidentResDto {
  @ApiProperty({ example: 'Pembegalan' })
  public category: string;

  @ApiProperty({
    example:
      'Jalan Warung Contong, Setiamanah, Cimahi, Jawa Barat, Jawa, 40524, Indonesia',
  })
  public location: string;

  @ApiProperty({ example: -6.884352875225879 })
  public latitude: number;

  @ApiProperty({ example: 107.52420901126096 })
  public longitude: number;

  @ApiProperty({ example: 'high' })
  public riskLevel: string;

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
    type: ReportPreviewDto,
    isArray: true,
  })
  public reports: ReportPreviewDto[];
}

export class IncidentParamDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'incident id',
  })
  @IsUUID(4, { message: 'id tidak valid' })
  public readonly id: string;
}
