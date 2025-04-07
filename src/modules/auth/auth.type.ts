import { Prisma } from '@prisma/client';

export type UserAuthSelection = Prisma.UserGetPayload<{
  select: { email: true; password: true; name: true; profilePhoto: true };
}>;
