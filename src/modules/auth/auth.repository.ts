import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { UserAuthSelection } from './auth.type';

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<UserAuthSelection | null>;
}

@Injectable()
export class AuthRepository extends BaseRepository implements IAuthRepository {
  public async findUserByEmail(
    email: string,
  ): Promise<UserAuthSelection | null> {
    return this.prisma.user.findFirst({
      where: { email },
      select: { email: true, name: true, password: true, profilePhoto: true },
    });
  }
}
