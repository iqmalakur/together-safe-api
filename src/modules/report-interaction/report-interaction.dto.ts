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
  @IsUUID(4, { message: 'ID laporan tidak valid' })
  public readonly reportId: string;
}

export class CommentParamDto {
  @ApiProperty({ example: '1' })
  @IsNumberString({}, { message: 'ID komentar tidak valid' })
  public readonly id: string;
}

export class VoteReqDto {
  @ApiProperty({ example: 'upvote' })
  @IsOptional()
  @IsEnum(VoteType, { message: 'Tipe vote tidak valid' })
  public readonly voteType?: VoteType;
}

export class VoteResDto {
  @ApiProperty({ example: 'john@example.com' })
  public readonly userEmail: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  public readonly reportId: string;

  @ApiProperty({ example: 'upvote' })
  public readonly voteType?: VoteType;
}

export class CommentReqDto {
  @ApiProperty({
    example:
      'Wah, serem banget! Gue sering lewat sini malem-malem, harus lebih hati-hati nih.',
  })
  @IsNotEmpty({ message: 'Komentar tidak boleh kosong' })
  public readonly comment: string;
}

export class ReportUserDto {
  @ApiProperty({ example: 'john@gmail.com' })
  public readonly email: string;

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

export class CommentResDto {
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
