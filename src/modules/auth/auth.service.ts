import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compareSync } from 'bcrypt';
import { AuthResDto, RegisterReqDto } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { getFileUrlOrNull, validateToken } from '../../utils/common.util';
import { UploadService } from '../../infrastructures/upload.service';
import { SuccessCreateDto } from '../shared/shared.dto';
import { AbstractLogger } from '../shared/abstract-logger';
import { sign } from 'jsonwebtoken';
import { SECRET_KEY } from '../../config/app.config';

@Injectable()
export class AuthService extends AbstractLogger {
  public constructor(
    private readonly uploadService: UploadService,
    private readonly repository: AuthRepository,
  ) {
    super();
  }

  public async handleLogin(
    email: string,
    password: string,
  ): Promise<AuthResDto> {
    const user = await this.repository.findUserByEmail(email);

    const isPasswordValid: boolean = user
      ? compareSync(password, user.password)
      : false;

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Email atau Password salah!');
    }

    return {
      email: user.email,
      name: user.name,
      profilePhoto: getFileUrlOrNull(user.profilePhoto),
      token: sign(
        {
          email: user.email,
          name: user.name,
          profilePhoto: user.profilePhoto,
        },
        SECRET_KEY,
        { expiresIn: '1w' },
      ),
    };
  }

  public async handleRegister(user: RegisterReqDto): Promise<SuccessCreateDto> {
    if (await this.repository.isUserExist(user.email)) {
      throw new ConflictException('Email sudah terdaftar!');
    }

    const password = bcrypt.hashSync(user.password, 10);

    let filename: string | null = null;
    if (user.profilePhoto) {
      filename = await this.uploadService.uploadFile(user.profilePhoto);
    }

    const result = await this.repository.createUser({
      email: user.email,
      name: user.name,
      password: password,
      profilePhoto: filename,
    });

    return {
      id: result.email,
      message: 'Pendaftaran pengguna berhasil',
    };
  }

  public async handleValidateToken(token: string): Promise<AuthResDto> {
    const tokenData = validateToken(token);

    if (!tokenData) {
      throw new UnauthorizedException('Token tidak valid!');
    }

    const user = await this.repository.findUserByEmail(tokenData.email);

    if (!user) {
      throw new UnauthorizedException('Token tidak valid!');
    }

    return {
      email: user.email,
      name: user.name,
      profilePhoto: getFileUrlOrNull(user.profilePhoto),
      token: sign(
        {
          email: user.email,
          name: user.name,
          profilePhoto: user.profilePhoto,
        },
        SECRET_KEY,
        { expiresIn: '1w' },
      ),
    };
  }
}
