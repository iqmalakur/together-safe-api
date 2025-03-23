import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HttpMiddleware } from './middlewares/http.middleware';
import { IncidentModule } from './modules/incident/incident.module';
import { AuthModule } from './modules/auth/auth.module';
import { GeolocationModule } from './modules/geolocation/geolocation.module';

@Module({
  imports: [AuthModule, IncidentModule, GeolocationModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*');
  }
}
