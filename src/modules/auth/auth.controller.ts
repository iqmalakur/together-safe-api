import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  LoginReqDto,
  AuthResDto,
  ValidateTokenReqDto,
  RegisterReqDto,
} from './auth.dto';
import { AuthService } from './auth.service';
import {
  ApiLogin,
  ApiRegister,
  ApiValidateToken,
} from '../../decorators/api-auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { SuccessCreateDto } from '../shared/shared.dto';
import { AbstractLogger } from '../shared/abstract-logger';

@Controller('auth')
@ApiTags('Auth')
export class AuthController extends AbstractLogger {
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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('profilePhoto'))
  @HttpCode(HttpStatus.CREATED)
  @ApiRegister()
  public async register(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: RegisterReqDto,
  ): Promise<SuccessCreateDto> {
    const data = plainToInstance(RegisterReqDto, {
      ...body,
      profilePhoto: file,
    });

    this.logger.debug(`request body: `, {
      ...data,
      profilePhoto: data.profilePhoto?.originalname,
    });

    return await this.service.handleRegister(data);
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
