import { Request } from 'express';

export type UserJwtPayload = {
  email: string;
  name: string;
  profilePhoto: string;
};

export type GeocodeResult = {
  name: string;
  display_name: string;
  lat: string;
  lon: string;
};

export interface AuthRequest extends Request {
  user: UserJwtPayload;
}
