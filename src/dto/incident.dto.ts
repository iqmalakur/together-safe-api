import { ApiProperty } from '@nestjs/swagger';

export class IncidentReport {
  @ApiProperty({ example: 'abcdefghijklmn' })
  public id: string;

  @ApiProperty({ example: 'Terjadi pembegalan di cimahi' })
  public description: string;
}

export class IncidentResBody {
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
    type: IncidentReport,
    isArray: true,
  })
  public reports: IncidentReport[];
}
