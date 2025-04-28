import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AbstractLogger } from '../shared/abstract-logger';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { ReportInteractionService } from './report-interaction.service';
import {
  CommentReqDto,
  ReportIdParamDto,
  VoteReqDto,
  VoteResDto,
} from './report-interaction.dto';
import { AuthRequest } from '../shared/shared.type';
import { VoteType } from '@prisma/client';
import {
  ApiComment,
  ApiVote,
} from 'src/decorators/api-report-interaction.decorator';

@Controller('report/:reportId')
@ApiTags('Report Interaction')
export class ReportInteractionController extends AbstractLogger {
  public constructor(private readonly service: ReportInteractionService) {
    super();
  }

  @Patch('vote')
  @ApiSecurity('jwt')
  @HttpCode(HttpStatus.OK)
  @ApiVote()
  public async vote(
    @Request() req: AuthRequest,
    @Param() param: ReportIdParamDto,
    @Body() body: VoteReqDto,
  ): Promise<VoteResDto> {
    this.logger.debug('request body: ', body);

    const userEmail = req.user.email;
    const { reportId } = param;
    const { voteType } = body;

    return this.service.handleVote(userEmail, reportId, voteType as VoteType);
  }

  @Post('comment')
  @ApiSecurity('jwt')
  @HttpCode(HttpStatus.CREATED)
  @ApiComment()
  public async comment(
    @Request() req: AuthRequest,
    @Param() param: ReportIdParamDto,
    @Body() body: CommentReqDto,
  ): Promise<VoteResDto> {
    this.logger.debug('request body: ', body);

    const userEmail = req.user.email;
    const { reportId } = param;
    const { comment } = body;

    return this.service.handleComment(userEmail, reportId, comment);
  }
}
