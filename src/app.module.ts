import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { HttpMiddleware } from './middlewares/http.middleware';
import { IncidentModule } from './modules/incident/incident.module';
import { AuthModule } from './modules/auth/auth.module';
import { GeolocationModule } from './modules/geolocation/geolocation.module';
import { ReportModule } from './modules/report/report.module';
import { TokenMiddleware } from './middlewares/token.middleware';
import { ReportInteractionModule } from './modules/report-interaction/report-interaction.module';
import { ReportInteractionController } from './modules/report-interaction/report-interaction.controller';

@Module({
  imports: [
    AuthModule,
    IncidentModule,
    ReportModule,
    ReportInteractionModule,
    GeolocationModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*');

    consumer
      .apply(TokenMiddleware)
      .forRoutes(
        { path: 'report', method: RequestMethod.GET },
        { path: 'report', method: RequestMethod.POST },
        ReportInteractionController,
      );
  }
}
