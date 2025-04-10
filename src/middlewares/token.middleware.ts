import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { AuthRequest } from 'src/modules/shared/shared.type';
import { validateToken } from 'src/utils/common.util';

@Injectable()
export class TokenMiddleware implements NestMiddleware {
  use(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
      throw new BadRequestException(['token harus diisi']);
    }

    const tokenFormat = /bearer .+/i;
    if (!tokenFormat.test(authHeader)) {
      throw new BadRequestException(['format token tidak valid']);
    }

    const token = authHeader.split(' ')[1];
    const user = validateToken(token);

    if (!user) {
      throw new UnauthorizedException('token tidak valid');
    }

    req.user = user;

    return next();
  }
}
