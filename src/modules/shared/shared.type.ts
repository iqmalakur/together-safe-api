import { Request } from 'express';

export type JwtPayload = { email: string };

export interface AuthRequest extends Request {
  user: JwtPayload;
}
