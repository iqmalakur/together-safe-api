import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AbstractLogger } from '../shared/abstract-logger';
import { ReportInteractionRepository } from './report-interaction.repository';
import {
  CommentResDto,
  UserVoteResDto,
  VoteResDto,
} from './report-interaction.dto';
import { ReportStatus, VoteType } from '@prisma/client';
import { getFileUrlOrNull } from 'src/utils/common.util';

@Injectable()
export class ReportInteractionService extends AbstractLogger {
  public constructor(private readonly repository: ReportInteractionRepository) {
    super();
  }

  public async handleUserVote(
    userEmail: string,
    reportId: string,
  ): Promise<UserVoteResDto> {
    const result = await this.repository.findUserVote(userEmail, reportId);

    if (!result) {
      return {
        userEmail,
        reportId,
        voteType: null as unknown as undefined,
      };
    }

    return result as UserVoteResDto;
  }

  public async handleVote(
    userEmail: string,
    reportId: string,
    prevVoteType: VoteType,
    newVoteType: VoteType,
  ): Promise<VoteResDto> {
    const report = await this.repository.findReport(reportId);

    if (!report) {
      throw new NotFoundException('Laporan tidak ditemukan');
    } else if (userEmail === report.userEmail) {
      throw new ConflictException(
        'Anda tidak dapat melakukan vote pada laporan Anda',
      );
    }

    const result = await this.repository.createOrUpdateVote(
      userEmail,
      reportId,
      newVoteType,
    );

    let reputationDelta = 0;
    if (!prevVoteType && newVoteType === 'upvote') reputationDelta = 1;
    else if (!prevVoteType && newVoteType === 'downvote') reputationDelta = -1;
    else if (prevVoteType === 'upvote' && newVoteType === 'downvote')
      reputationDelta = -2;
    else if (prevVoteType === 'upvote' && !newVoteType) reputationDelta = -1;
    else if (prevVoteType === 'downvote' && newVoteType === 'upvote')
      reputationDelta = 2;
    else if (prevVoteType === 'downvote' && !newVoteType) reputationDelta = 1;

    const reputation = await this.repository.updateAndGetUserReputation(
      report.userEmail,
      reputationDelta,
    );

    this.checkReportValidity(reportId);

    return {
      ...result,
      reporterReputation: reputation,
    };
  }

  public async handleCreateComment(
    userEmail: string,
    reportId: string,
    comment: string,
  ): Promise<CommentResDto> {
    const result = await this.repository.createComment(
      userEmail,
      reportId,
      comment,
    );
    return {
      id: result.id,
      comment: result.comment,
      createdAt: result.createdAt,
      isEdited: result.updatedAt.getTime() !== result.createdAt.getTime(),
      user: {
        ...result.user,
        profilePhoto: getFileUrlOrNull(result.user.profilePhoto),
      },
    };
  }

  public async handleUpdateComment(
    userEmail: string,
    commentId: number,
    comment: string,
  ): Promise<CommentResDto> {
    const result = await this.repository.editComment(
      userEmail,
      commentId,
      comment,
    );

    if (!result) {
      throw new NotFoundException(
        'Komentar tidak ditemukan atau Anda tidak memiliki komentar ini',
      );
    }

    return {
      id: result.id,
      comment: result.comment,
      createdAt: result.createdAt,
      isEdited: result.updatedAt.getTime() !== result.createdAt.getTime(),
      user: {
        ...result.user,
        profilePhoto: getFileUrlOrNull(result.user.profilePhoto),
      },
    };
  }

  public async handleDeleteComment(
    userEmail: string,
    commentId: number,
  ): Promise<CommentResDto> {
    const result = await this.repository.deleteComment(userEmail, commentId);

    if (!result) {
      throw new NotFoundException(
        'Komentar tidak ditemukan atau Anda tidak memiliki komentar ini',
      );
    }

    return {
      id: result.id,
      comment: result.comment,
      createdAt: result.createdAt,
      isEdited: result.updatedAt.getTime() !== result.createdAt.getTime(),
      user: {
        ...result.user,
        profilePhoto: getFileUrlOrNull(result.user.profilePhoto),
      },
    };
  }

  private async checkReportValidity(reportId: string) {
    const report = await this.repository.findReport(reportId);

    if (!report) {
      this.logger.debug('Laporan tidak ditemukan');
      return;
    }

    const upvotes = report.votes.filter(
      (vote) => vote.type === 'upvote',
    ).length;
    const downvotes = report.votes.filter(
      (vote) => vote.type === 'downvote',
    ).length;

    const status = this.calculateReportStatus(upvotes, downvotes);
    await this.repository.updateReportStatus(reportId, status);
  }

  private calculateReportStatus(
    upvotes: number,
    downvotes: number,
  ): ReportStatus {
    const minVotes = 10;

    const totalVotes = upvotes + downvotes;
    if (totalVotes < minVotes) {
      return 'crowdsourced';
    }

    const validPercentage = (upvotes / totalVotes) * 100;
    const invalidPercentage = (downvotes / totalVotes) * 100;

    if (validPercentage >= 80) {
      return 'verified';
    } else if (invalidPercentage >= 60) {
      return 'invalid';
    }

    return 'crowdsourced';
  }
}
