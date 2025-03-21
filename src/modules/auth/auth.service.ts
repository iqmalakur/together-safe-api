import { Injectable, UnauthorizedException } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { compareSync } from 'bcrypt';
import { AuthResDto } from './auth.dto';
import { AuthRepository, IAuthRepository } from './auth.repository';
import { validateToken } from '../../utils/common.util';

@Injectable()
export class AuthService extends BaseService<IAuthRepository> {
  public constructor(repository: AuthRepository) {
    super(repository);
  }

  public async handleLogin(
    email: string,
    password: string,
  ): Promise<AuthResDto> {
    const user = await this.repository.findUserByEmail(email);

    const isPasswordValid: boolean = user
      ? compareSync(password, user.password)
      : false;

    if (!isPasswordValid) {
      throw new UnauthorizedException('email atau password salah!');
    }

    return new AuthResDto(user!);
  }

  public async handleValidateToken(token: string): Promise<AuthResDto> {
    const tokenData = validateToken(token);

    if (!tokenData) {
      throw new UnauthorizedException('token tidak valid!');
    }

    const user = await this.repository.findUserByEmail(tokenData.email);

    if (!user) {
      throw new UnauthorizedException('token tidak valid!');
    }

    return new AuthResDto(user);
  }
}
