import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { handleError } from 'src/utils/common.util';
import { Vote, VoteType } from '@prisma/client';

@Injectable()
export class ReportInteractionRepository extends BaseRepository {
  public async createOrUpdateVote(
    userEmail: string,
    reportId: string,
    voteType?: VoteType,
  ): Promise<Vote> {
    try {
      const type = voteType ?? null;
      return this.prisma.vote.upsert({
        where: {
          userEmail_reportId: {
            userEmail,
            reportId,
          },
        },
        create: {
          userEmail,
          reportId,
          type,
        },
        update: { type },
      });
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }
}
