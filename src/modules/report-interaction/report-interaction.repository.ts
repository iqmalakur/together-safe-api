import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { handleError } from 'src/utils/common.util';
import { Vote, VoteType } from '@prisma/client';
import { ReportComment } from './report-interaction.type';

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
  ): Promise<ReportComment> {
    try {
      return this.prisma.comment.create({
        data: {
          userEmail,
          reportId,
          comment,
        },
        include: {
          user: {
            select: {
              email: true,
              name: true,
              profilePhoto: true,
              reputation: true,
            },
          },
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
  ): Promise<ReportComment | null> {
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
        include: {
          user: {
            select: {
              email: true,
              name: true,
              profilePhoto: true,
              reputation: true,
            },
          },
        },
      });
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }

  public async deleteComment(
    userEmail: string,
    commentId: number,
  ): Promise<ReportComment | null> {
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
        include: {
          user: {
            select: {
              email: true,
              name: true,
              profilePhoto: true,
              reputation: true,
            },
          },
        },
      });
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }
}
