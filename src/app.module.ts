import { PrismaService } from './services/prisma.service';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { IncidentController } from './controllers/incident.controller';
import { IncidentService } from './services/incident.service';
import { HttpMiddleware } from './middlewares/http.middleware';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';

@Module({
  imports: [],
  controllers: [IncidentController, AuthController],
  providers: [PrismaService, IncidentService, AuthService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*');
  }
}
