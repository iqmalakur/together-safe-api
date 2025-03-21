import { Injectable, UnauthorizedException } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { compareSync } from 'bcrypt';
import { LoginResDto } from './auth.dto';
import { AuthRepository, IAuthRepository } from './auth.repository';

@Injectable()
export class AuthService extends BaseService<IAuthRepository> {
  public constructor(repository: AuthRepository) {
    super(repository);
  }

  public async handleLogin(
    email: string,
    password: string,
  ): Promise<LoginResDto> {
    const user = await this.repository.findUserByEmail(email);

    const isPasswordValid: boolean = user
      ? compareSync(password, user.password)
      : false;

    if (!isPasswordValid) {
      throw new UnauthorizedException('email atau password salah!');
    }

    return new LoginResDto(user!);
  }
}
