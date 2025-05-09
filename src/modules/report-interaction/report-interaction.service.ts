import { Injectable, NotFoundException } from '@nestjs/common';
import { AbstractLogger } from '../shared/abstract-logger';
import { ReportInteractionRepository } from './report-interaction.repository';
import { CommentResDto, VoteResDto } from './report-interaction.dto';
import { VoteType } from '@prisma/client';
import { getFileUrlOrNull } from 'src/utils/common.util';

@Injectable()
export class ReportInteractionService extends AbstractLogger {
  public constructor(private readonly repository: ReportInteractionRepository) {
    super();
  }

  public async handleUserVote(
    userEmail: string,
    reportId: string,
  ): Promise<VoteResDto> {
    const result = await this.repository.findUserVote(userEmail, reportId);

    if (!result) {
      return {
        userEmail,
        reportId,
        voteType: null as unknown as undefined,
      };
    }

    return result as VoteResDto;
  }

  public async handleVote(
    userEmail: string,
    reportId: string,
    voteType?: VoteType,
  ): Promise<VoteResDto> {
    const result = await this.repository.createOrUpdateVote(
      userEmail,
      reportId,
      voteType,
    );
    return result as VoteResDto;
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
}
