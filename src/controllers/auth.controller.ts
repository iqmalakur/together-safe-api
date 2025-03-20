import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { ApiIncident } from '../decorators/api-incident.decorator';
import { LoginReqDto, LoginResDto } from 'src/dto/auth.dto';
import { AuthService } from 'src/services/auth.service';

@Controller('auth')
@ApiTags('Auth')
export class AuthController extends BaseController {
  public constructor(private readonly service: AuthService) {
    super();
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiIncident()
  public async login(@Body() reqBody: LoginReqDto): Promise<LoginResDto> {
    this.logger.debug(`request body: `, reqBody);

    const { email, password } = reqBody;

    if (!email) {
      throw new BadRequestException('email harus diisi!');
    }

    if (!password) {
      throw new BadRequestException('password harus diisi!');
    }

    return await this.service.handleLogin(email, password);
  }
}
