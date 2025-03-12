import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction, Send } from 'express';
import { LoggerUtil } from '../utils/logger.util';

@Injectable()
export class HttpMiddleware implements NestMiddleware {
  private readonly logger = new LoggerUtil(HttpMiddleware.name);

  public use(req: Request, res: Response, next: NextFunction) {
    const start: number = Date.now();
    this.logger.http(`${req.method} ${req.originalUrl}`);

    const logResponse = (body: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.logger.debug(`response body: `, body);
    };

    // Override res.json method
    const send: Send = res.send;
    res.send = function (body: any) {
      if (body) logResponse(body);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return send.call(this, body);
    };

    res.on('finish', () => {
      const duration: number = Date.now() - start;
      this.logger.http(
        `${req.method} ${req.originalUrl} - ${res.statusCode} ${res.statusMessage} - ${duration}ms`,
      );
    });

    res.setHeader('Content-Type', 'application/json');
    next();
  }
}
