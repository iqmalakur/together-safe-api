import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../shared/base.controller';
import { LoginReqDto, LoginResDto } from './auth.dto';
import { AuthService } from './auth.service';
import { ApiLogin } from 'src/decorators/api-auth.decorator';

@Controller('auth')
@ApiTags('Auth')
export class AuthController extends BaseController {
  public constructor(private readonly service: AuthService) {
    super();
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiLogin()
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
