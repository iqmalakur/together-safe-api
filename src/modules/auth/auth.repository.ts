import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { UserAuthSelection } from './auth.type';
import { Prisma } from '@prisma/client';
import { handleError } from 'src/utils/common.util';

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<UserAuthSelection | null>;
  isUserExist(email: string): Promise<boolean>;
  createUser(user: Prisma.UserCreateInput): Promise<UserAuthSelection>;
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

  public async isUserExist(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email },
    });
    return count > 0;
  }

  public async createUser(
    user: Prisma.UserCreateInput,
  ): Promise<UserAuthSelection> {
    try {
      return await this.prisma.user.create({
        data: user,
        select: { email: true, password: true, name: true, profilePhoto: true },
      });
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }
}
