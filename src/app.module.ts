import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HttpMiddleware } from './middlewares/http.middleware';
import { IncidentModule } from './modules/incident/incident.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [AuthModule, IncidentModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*');
  }
}
