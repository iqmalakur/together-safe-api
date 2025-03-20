import { ApiProperty } from '@nestjs/swagger';
import { getPhotoUrl } from '../utils/common.util';
import { sign } from 'jsonwebtoken';
import { SECRET_KEY } from '../config/app.config';
import { UserAuthSelection } from '../types/auth.type';

export class LoginReqDto {
  @ApiProperty({ example: 'john@example.com' })
  public readonly email: string;

  @ApiProperty({ example: 'rahasia' })
  public readonly password: string;
}

export class LoginResDto {
  @ApiProperty({ example: 'john@example.com' })
  public readonly email: string;

  @ApiProperty({ example: 'John Marston' })
  public readonly name: string;

  @ApiProperty({
    example:
      'https://lh3.googleusercontent.com/d/22ZximVkuhxCuS_j_Vve2CKTyHiju0aY=s220',
  })
  public readonly profilePhoto: string;

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
  }
}
