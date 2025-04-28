import { Injectable } from '@nestjs/common';
import { AbstractLogger } from '../shared/abstract-logger';
import { ReportInteractionRepository } from './report-interaction.repository';
import { VoteResDto } from './report-interaction.dto';
import { VoteType } from '@prisma/client';

@Injectable()
export class ReportInteractionService extends AbstractLogger {
  public constructor(private readonly repository: ReportInteractionRepository) {
    super();
  }

  public async handleVote(
    userEmail: string,
    reportId: string,
    voteType: VoteType,
  ): Promise<VoteResDto> {
    const result = await this.repository.createOrUpdateVote(
      userEmail,
      reportId,
      voteType,
    );
    return result as VoteResDto;
  }
}
