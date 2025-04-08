import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { BaseController } from '../shared/base.controller';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ReportReqDto } from './report.dto';
import { plainToInstance } from 'class-transformer';
import { ReportService } from './report.service';
import { AuthRequest } from '../shared/shared.type';

@Controller('report')
@ApiTags('Report')
export class ReportController extends BaseController {
  public constructor(private readonly service: ReportService) {
    super();
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('media'))
  @HttpCode(HttpStatus.CREATED)
  // @ApiPostReport()
  public async createReport(
    @Request() req: AuthRequest,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: ReportReqDto,
  ) {
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
