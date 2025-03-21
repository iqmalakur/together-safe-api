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
import { LoginReqDto, AuthResDto, ValidateTokenReqDto } from './auth.dto';
import { AuthService } from './auth.service';
import {
  ApiLogin,
  ApiValidateToken,
} from '../../decorators/api-auth.decorator';

@Controller('auth')
@ApiTags('Auth')
export class AuthController extends BaseController {
  public constructor(private readonly service: AuthService) {
    super();
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiLogin()
  public async login(@Body() reqBody: LoginReqDto): Promise<AuthResDto> {
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

  @Post('validate_token')
  @HttpCode(HttpStatus.OK)
  @ApiValidateToken()
  public async validateToken(
    @Body() reqBody: ValidateTokenReqDto,
  ): Promise<AuthResDto> {
    this.logger.debug(`request body: `, reqBody);

    const { token } = reqBody;

    if (!token) {
      throw new BadRequestException('token harus diisi!');
    }

    return await this.service.handleValidateToken(token);
  }
}
