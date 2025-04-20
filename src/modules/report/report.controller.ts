import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ReportParamDto,
  ReportPreviewDto,
  ReportReqDto,
  ReportResDto,
} from './report.dto';
import { plainToInstance } from 'class-transformer';
import { ReportService } from './report.service';
import { AuthRequest } from '../shared/shared.type';
import {
  ApiPostReport,
  ApiReport,
  ApiUserReport,
} from 'src/decorators/api-report.decorator';
import { SuccessCreateDto } from '../shared/shared.dto';
import { AbstractLogger } from '../shared/abstract-logger';

@Controller('report')
@ApiTags('Report')
export class ReportController extends AbstractLogger {
  public constructor(private readonly service: ReportService) {
    super();
  }

  @Get()
  @ApiSecurity('jwt')
  @HttpCode(HttpStatus.OK)
  @ApiUserReport()
  public async getUserReport(
    @Request() req: AuthRequest,
  ): Promise<ReportPreviewDto[]> {
    return await this.service.handleGetUserReport(req.user);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiReport()
  public async getReport(
    @Param() param: ReportParamDto,
  ): Promise<ReportResDto> {
    return await this.service.handleGetReport(param.id);
  }

  @Post()
  @ApiSecurity('jwt')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('media'))
  @HttpCode(HttpStatus.CREATED)
  @ApiPostReport()
  public async createReport(
    @Request() req: AuthRequest,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: ReportReqDto,
  ): Promise<SuccessCreateDto> {
    const data = plainToInstance(ReportReqDto, {
      ...body,
      categoryId: parseInt((body as any).categoryId),
      media: files,
    });

    this.logger.debug('request body: ', {
      ...data,
      media: data.media.map((file) => file?.originalname),
    });

    return this.service.handleCreateReport(req.user, data);
  }
}
