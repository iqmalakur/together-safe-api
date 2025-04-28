import { ApiProperty } from '@nestjs/swagger';
import { VoteType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class ReportIdParamDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID(4, { message: 'id laporan tidak valid' })
  public reportId: string;
}

export class CommentParamDto {
  @ApiProperty({ example: '1' })
  @IsNumberString({}, { message: 'id komentar tidak valid' })
  public id: string;
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

export class CommentReqDto {
  @ApiProperty({
    example:
      'Wah, serem banget! Gue sering lewat sini malem-malem, harus lebih hati-hati nih.',
  })
  @IsNotEmpty({ message: 'komentar tidak boleh kosong' })
  public comment: string;
}

export class CommentResDto {
  @ApiProperty({ example: 1 })
  public id: number;

  @ApiProperty({ example: 'john@example.com' })
  public userEmail: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  public reportId: string;

  @ApiProperty({
    example:
      'Wah, serem banget! Gue sering lewat sini malem-malem, harus lebih hati-hati nih.',
  })
  public comment: string;
}
