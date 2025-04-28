import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AbstractLogger } from '../shared/abstract-logger';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Request,
} from '@nestjs/common';
import { ReportInteractionService } from './report-interaction.service';
import { VoteParamDto, VoteReqDto, VoteResDto } from './report-interaction.dto';
import { AuthRequest } from '../shared/shared.type';
import { VoteType } from '@prisma/client';
import { ApiVote } from 'src/decorators/api-report-interaction.decorator';

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
    @Param() param: VoteParamDto,
    @Body() body: VoteReqDto,
  ): Promise<VoteResDto> {
    this.logger.debug('request body: ', body);

    const userEmail = req.user.email;
    const { reportId } = param;
    const { voteType } = body;

    return this.service.handleVote(userEmail, reportId, voteType as VoteType);
  }
}
