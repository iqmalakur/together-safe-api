import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { GeolocationController } from './geolocation.controller';
import { GeolocationService } from './geolocation.service';
import { GeolocationRepository } from './geolocation.repository';

@Module({
  imports: [SharedModule],
  controllers: [GeolocationController],
  providers: [GeolocationService, GeolocationRepository],
})
export class GeolocationModule {}
