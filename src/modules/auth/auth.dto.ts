import { ApiProperty } from '@nestjs/swagger';
import { getPhotoUrl } from '../../utils/common.util';
import { sign } from 'jsonwebtoken';
import { SECRET_KEY } from '../../config/app.config';
import { UserAuthSelection } from './auth.type';

export class ValidateTokenReqDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkkujCJ9.eyJuaWsiOiIwMDEhugewNDU2MDA3MDEiLCJpYXQiOjE3MjcxMzczNjAsImV4cCI6MTcyNzc0MjE2MH0.uGwjj2AmJwJJ77QuZFf6nccBjkpbyW29Q2s0_69jjiE',
  })
  public readonly token: string;
}

export class LoginReqDto {
  @ApiProperty({ example: 'john@example.com' })
  public readonly email: string;

  @ApiProperty({ example: 'rahasia' })
  public readonly password: string;
}

export class RegisterReqDto {
  @ApiProperty({ example: 'john@example.com' })
  public readonly email: string;

  @ApiProperty({ example: 'rahasia' })
  public readonly password: string;

  @ApiProperty({ example: 'John Marston' })
  public readonly name: string;

  @ApiProperty({ example: '08123456789' })
  public readonly phone: string;

  @ApiProperty({
    description: 'foto profil',
    type: 'string',
    format: 'buffer',
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

    if (user.profilePhoto) this.profilePhoto = getPhotoUrl(user.profilePhoto);
    else this.profilePhoto = null;
  }
}
