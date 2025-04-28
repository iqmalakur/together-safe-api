import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AbstractLogger } from '../shared/abstract-logger';
import {
  Body,
  Controller,
  Delete,
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
  ApiVote,
} from 'src/decorators/api-report-interaction.decorator';

@Controller('report')
@ApiTags('Report Interaction')
export class ReportInteractionController extends AbstractLogger {
  public constructor(private readonly service: ReportInteractionService) {
    super();
  }

  @Patch(':reportId/vote')
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

  @Post(':reportId/comment')
  @ApiSecurity('jwt')
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
  @ApiSecurity('jwt')
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
  @ApiSecurity('jwt')
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
