import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { UserAuthSelection, UserCreateSelection } from './auth.type';
import { Prisma } from '@prisma/client';
import { handleError } from 'src/utils/common.util';

@Injectable()
export class AuthRepository extends BaseRepository {
  public async findUserByEmail(
    email: string,
  ): Promise<UserAuthSelection | null> {
    return this.prisma.user.findFirst({
      where: { email },
      select: { email: true, name: true, password: true, profilePhoto: true },
    });
  }

  public async isUserExist(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email },
    });
    return count > 0;
  }

  public async createUser(
    user: Prisma.UserCreateInput,
  ): Promise<UserCreateSelection> {
    try {
      return await this.prisma.user.create({
        data: user,
        select: { email: true },
      });
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }
}
