import { Injectable, UnauthorizedException } from '@nestjs/common';
import { BaseService } from './base.service';
import { compareSync } from 'bcrypt';
import { LoginResDto } from 'src/dto/auth.dto';

@Injectable()
export class AuthService extends BaseService {
  public async handleLogin(
    email: string,
    password: string,
  ): Promise<LoginResDto> {
    const user = await this.prisma.user.findFirst({
      where: { email },
      select: { email: true, name: true, password: true, profilePhoto: true },
    });

    const isPasswordValid: boolean = user
      ? compareSync(password, user.password)
      : false;

    if (!isPasswordValid) {
      throw new UnauthorizedException('email atau password salah!');
    }

    return new LoginResDto(user!);
  }
}
