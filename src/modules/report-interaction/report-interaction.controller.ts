import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AbstractLogger } from '../shared/abstract-logger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { ReportInteractionService } from './report-interaction.service';
import {
  CommentParamDto,
  CommentReqDto,
  CommentResDto,
  ReportIdParamDto,
  VoteReqDto,
  VoteResDto,
} from './report-interaction.dto';
import { AuthRequest } from '../shared/shared.type';
import { VoteType } from '@prisma/client';
import {
  ApiComment,
  ApiDeleteComment,
  ApiUpdateComment,
  ApiUserVote,
  ApiVote,
} from 'src/decorators/api-report-interaction.decorator';

@Controller('report')
@ApiSecurity('jwt')
@ApiTags('Report Interaction')
export class ReportInteractionController extends AbstractLogger {
  public constructor(private readonly service: ReportInteractionService) {
    super();
  }

  @Get(':reportId/vote')
  @HttpCode(HttpStatus.OK)
  @ApiUserVote()
  public async userVote(
    @Request() req: AuthRequest,
    @Param() param: ReportIdParamDto,
  ): Promise<VoteResDto> {
    const userEmail = req.user.email;
    const { reportId } = param;

    return this.service.handleUserVote(userEmail, reportId);
  }

  @Patch(':reportId/vote')
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

  @Post(':reportId/comment')
  @HttpCode(HttpStatus.CREATED)
  @ApiComment()
  public async createComment(
    @Request() req: AuthRequest,
    @Param() param: ReportIdParamDto,
    @Body() body: CommentReqDto,
  ): Promise<VoteResDto> {
    this.logger.debug('request body: ', body);

    const userEmail = req.user.email;
    const { reportId } = param;
    const { comment } = body;

    return this.service.handleCreateComment(userEmail, reportId, comment);
  }

  @Patch('comment/:id')
  @HttpCode(HttpStatus.OK)
  @ApiUpdateComment()
  public async updateComment(
    @Request() req: AuthRequest,
    @Param() param: CommentParamDto,
    @Body() body: CommentReqDto,
  ): Promise<CommentResDto> {
    this.logger.debug('request body: ', body);

    const userEmail = req.user.email;
    const id = parseInt(param.id);
    const { comment } = body;

    return this.service.handleUpdateComment(userEmail, id, comment);
  }

  @Delete('comment/:id')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteComment()
  public async deleteComment(
    @Request() req: AuthRequest,
    @Param() param: CommentParamDto,
  ): Promise<CommentResDto> {
    const userEmail = req.user.email;
    const id = parseInt(param.id);

    return this.service.handleDeleteComment(userEmail, id);
  }
}
