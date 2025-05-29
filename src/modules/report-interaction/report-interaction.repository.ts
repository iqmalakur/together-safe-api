import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { handleError } from '../../utils/common.util';
import { IncidentStatus, Vote, VoteType } from '@prisma/client';
import {
  ReportComment,
  IncidentVoteResult,
  ReportVoteResult,
} from './report-interaction.type';
import { VoteCountResult } from '../incident/incident.type';

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

  public async findReport(reportId: string): Promise<ReportVoteResult | null> {
    try {
      return this.prisma.report.findFirst({
        where: { id: reportId },
        select: {
          incidentId: true,
          userEmail: true,
          isAnonymous: true,
          votes: { select: { type: true } },
        },
      });
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }

  public async findIncident(
    reportId: string,
  ): Promise<IncidentVoteResult | null> {
    try {
      const report = await this.prisma.report.findFirst({
        where: { id: reportId },
        select: {
          incident: {
            select: { id: true, status: true },
          },
        },
      });

      if (!report) {
        return null;
      }

      const votes = await this.prisma.$queryRaw<VoteCountResult[]>`
        SELECT
          COUNT(*) FILTER (WHERE v."type" = 'upvote')::int AS upvote_count,
          COUNT(*) FILTER (WHERE v."type" = 'downvote')::int AS downvote_count
        FROM "Vote" v
        INNER JOIN "Report" r ON v."report_id" = r."id"
        WHERE r."incident_id" = ${report.incident.id}::uuid
      `;

      if (!votes[0]) {
        return null;
      }

      return {
        id: report.incident.id,
        status: report.incident.status,
        upvote_count: votes[0].upvote_count,
        downvote_count: votes[0].downvote_count,
      };
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }

  public async updateIncidentStatus(
    incidentId: string,
    status: IncidentStatus,
  ) {
    try {
      await this.prisma.incident.update({
        where: { id: incidentId },
        data: { status },
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
            },
          },
        },
      });
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }
}
