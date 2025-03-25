import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../shared/base.controller';
import { GeolocationService } from './geolocation.service';
import { GeolocationSearchQueryDto } from './geolocation.dto';
import { ApiSearch } from 'src/decorators/api-geolocation.decorator';

@Controller('geolocation')
@ApiTags('Geolocation')
export class GeolocationController extends BaseController {
  public constructor(private readonly service: GeolocationService) {
    super();
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiSearch()
  public async search(@Query() queryParam: GeolocationSearchQueryDto) {
    return this.service.handleSearchLocation(queryParam.q);
  }
}
