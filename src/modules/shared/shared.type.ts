import { Request } from 'express';

export type UserJwtPayload = {
  email: string;
  name: string;
  profilePhoto: string;
};

export interface AuthRequest extends Request {
  user: UserJwtPayload;
}
