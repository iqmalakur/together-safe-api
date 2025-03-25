import { ApiProperty } from '@nestjs/swagger';
import { getFileUrl } from '../../utils/common.util';
import { sign } from 'jsonwebtoken';
import { SECRET_KEY } from '../../config/app.config';
import { UserAuthSelection } from './auth.type';
import {
  IsEmail,
  IsNotEmpty,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class ValidateTokenReqDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkkujCJ9.eyJuaWsiOiIwMDEhugewNDU2MDA3MDEiLCJpYXQiOjE3MjcxMzczNjAsImV4cCI6MTcyNzc0MjE2MH0.uGwjj2AmJwJJ77QuZFf6nccBjkpbyW29Q2s0_69jjiE',
  })
  @IsNotEmpty({ message: 'token harus diisi' })
  public readonly token: string;
}

export class LoginReqDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail({}, { message: 'email tidak valid' })
  @IsNotEmpty({ message: 'email harus diisi' })
  public readonly email: string;

  @ApiProperty({ example: 'rahasia' })
  @IsNotEmpty({ message: 'password harus diisi' })
  public readonly password: string;
}

export class RegisterReqDto {
  @ApiProperty({ description: 'example: john@example.com' })
  @IsEmail({}, { message: 'email tidak valid' })
  @IsNotEmpty({ message: 'email harus diisi' })
  public readonly email: string;

  @ApiProperty({ description: 'example: rahasia' })
  @IsNotEmpty({ message: 'password harus diisi' })
  @MinLength(8, { message: 'password minimal terdiri dari 8 karakter' })
  @Matches(/[A-Z]/, {
    message: 'password harus mengandung minimal satu huruf besar',
  })
  @Matches(/[a-z]/, {
    message: 'password harus mengandung minimal satu huruf kecil',
  })
  @Matches(/\d/, {
    message: 'password harus mengandung minimal satu angka',
  })
  public readonly password: string;

  @ApiProperty({ description: 'example: John Marston' })
  @IsNotEmpty({ message: 'nama harus diisi' })
  public readonly name: string;

  @ApiProperty({ description: 'example: 08123456789' })
  @IsNotEmpty({ message: 'nomor telepon harus diisi' })
  @Length(10, 13, {
    message: 'nomor telepon harus terdiri dari 10 hingga 13 digit',
  })
  @Matches(/^08\d+$/, {
    message: 'nomor telepon harus dimulai dengan 08 dan hanya mengandung angka',
  })
  public readonly phone: string;

  @ApiProperty({
    description: 'profile photo (file)',
    type: 'string',
    format: 'binary',
  })
  public readonly profilePhoto: Express.Multer.File;
}

export class AuthResDto {
  @ApiProperty({ example: 'john@example.com' })
  public readonly email: string;

  @ApiProperty({ example: 'John Marston' })
  public readonly name: string;

  @ApiProperty({
    example:
      'https://lh3.googleusercontent.com/d/22ZximVkuhxCuS_j_Vve2CKTyHiju0aY=s220',
  })
  public readonly profilePhoto: string | null;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkkujCJ9.eyJuaWsiOiIwMDEhugewNDU2MDA3MDEiLCJpYXQiOjE3MjcxMzczNjAsImV4cCI6MTcyNzc0MjE2MH0.uGwjj2AmJwJJ77QuZFf6nccBjkpbyW29Q2s0_69jjiE',
  })
  public readonly token: string;

  public constructor(user: UserAuthSelection) {
    this.email = user.email;
    this.name = user.name;
    this.token = sign({ email: user.email }, SECRET_KEY, { expiresIn: '1w' });

    if (user.profilePhoto) this.profilePhoto = getFileUrl(user.profilePhoto);
    else this.profilePhoto = null;
  }
}
