import { ApiProperty } from '@nestjs/swagger';
import { VoteType } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class VoteParamDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID(4, { message: 'id laporan tidak valid' })
  public reportId: string;
}

export class VoteReqDto {
  @ApiProperty({ example: 'upvote' })
  @IsOptional()
  @IsEnum(VoteType, { message: 'tipe vote tidak valid' })
  public voteType?: VoteType;
}

export class VoteResDto {
  @ApiProperty({ example: 'john@example.com' })
  public userEmail: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  public reportId: string;

  @ApiProperty({ example: 'upvote' })
  public voteType?: VoteType;
}
