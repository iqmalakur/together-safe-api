import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { handleError } from 'src/utils/common.util';
import { Vote, VoteType, Comment } from '@prisma/client';

@Injectable()
export class ReportInteractionRepository extends BaseRepository {
  public async findUserVote(
    userEmail: string,
    reportId: string,
  ): Promise<Vote | null> {
    try {
      return this.prisma.vote.findFirst({
        where: { userEmail, reportId },
      });
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }

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

  public async createComment(
    userEmail: string,
    reportId: string,
    comment: string,
  ): Promise<Comment> {
    try {
      return this.prisma.comment.create({
        data: {
          userEmail,
          reportId,
          comment,
        },
      });
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }

  public async editComment(
    userEmail: string,
    commentId: number,
    newComment: string,
  ): Promise<Comment | null> {
    try {
      const comment = await this.prisma.comment.findFirst({
        where: {
          userEmail,
          id: commentId,
        },
      });

      if (!comment) {
        return null;
      }

      return this.prisma.comment.update({
        where: { id: commentId },
        data: { comment: newComment, updatedAt: new Date() },
      });
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }

  public async deleteComment(
    userEmail: string,
    commentId: number,
  ): Promise<Comment | null> {
    try {
      const comment = await this.prisma.comment.findFirst({
        where: {
          userEmail,
          id: commentId,
        },
      });

      if (!comment) {
        return null;
      }

      return this.prisma.comment.delete({
        where: { id: commentId },
      });
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }
}
