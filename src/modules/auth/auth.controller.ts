import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../shared/base.controller';
import {
  LoginReqDto,
  AuthResDto,
  ValidateTokenReqDto,
  RegisterReqDto,
} from './auth.dto';
import { AuthService } from './auth.service';
import {
  ApiLogin,
  ApiValidateToken,
} from '../../decorators/api-auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';

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
    return await this.service.handleLogin(email, password);
  }

  @Post('register')
  @UseInterceptors(FileInterceptor('profilePhoto'))
  @HttpCode(HttpStatus.CREATED)
  public async register(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: RegisterReqDto,
  ): Promise<AuthResDto> {
    const data = plainToInstance(RegisterReqDto, {
      ...body,
      profilePhoto: file,
    });

    this.logger.debug(`request body: `, {
      ...data,
      profilePhoto: data.profilePhoto.originalname,
    });

    return this.service.handleRegister(data);
  }

  @Post('validate_token')
  @HttpCode(HttpStatus.OK)
  @ApiValidateToken()
  public async validateToken(
    @Body() reqBody: ValidateTokenReqDto,
  ): Promise<AuthResDto> {
    this.logger.debug(`request body: `, reqBody);
    return await this.service.handleValidateToken(reqBody.token);
  }
}
