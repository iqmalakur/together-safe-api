import { PrismaService } from './services/prisma.service';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { IncidentController } from './controllers/incident.controller';
import { IncidentService } from './services/incident.service';
import { HttpMiddleware } from './middlewares/http.middleware';

@Module({
  imports: [],
  controllers: [IncidentController],
  providers: [PrismaService, IncidentService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*');
  }
}
