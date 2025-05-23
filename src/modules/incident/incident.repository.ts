import { Injectable } from '@nestjs/common';
import {
  IncidentResult,
  IncidentSelection,
  VoteCountResult,
} from './incident.type';
import { BaseRepository } from '../shared/base.repository';
import { handleError } from 'src/utils/common.util';
import { ReportItemResult } from '../report/report.type';
import { IncidentCategory } from '@prisma/client';

@Injectable()
export class IncidentRepository extends BaseRepository {
  public async findNearbyIncidents(
    latitude: number,
    longitude: number,
  ): Promise<IncidentResult[]> {
    try {
      return await this.prisma.$queryRaw<IncidentResult[]>`
        SELECT
          i.id,
          i.status,
          i.risk_level,
          i.date_start,
          i.date_end,
          i.time_start,
          i.time_end,
          i.radius,
          ST_Y(location) AS latitude,
          ST_X(location) AS longitude,
          ic.name AS category
        FROM "Incident" i
        JOIN "IncidentCategory" ic ON ic.id = i.category_id
        WHERE status IN ('admin_verified', 'verified', 'pending') AND
          CURRENT_DATE BETWEEN i.date_start AND (i.date_end + ic.ttl_date) AND
          CURRENT_TIME BETWEEN (i.time_start - INTERVAL '1 hour') AND (i.time_end + INTERVAL '1 hour') AND
          ST_DWithin(
            location::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
            15000
          )
        ORDER BY i.updated_at DESC
      `;
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }

  public async findIncidentById(id: string): Promise<IncidentSelection | null> {
    try {
      const result = await this.prisma.$queryRaw<IncidentResult[]>`
        SELECT
          i.id,
          i.status,
          i.risk_level,
          i.date_start,
          i.date_end,
          i.time_start,
          i.time_end,
          i.radius,
          ST_Y(location) AS latitude,
          ST_X(location) AS longitude,
          ic.name AS category
        FROM "Incident" i
        JOIN "IncidentCategory" ic ON ic.id = i.category_id
        WHERE i.id = ${id}::uuid
      `;

      const incident = result[0];
      if (!incident) {
        return null;
      }

      const reports = await this.prisma.report.findMany({
        select: {
          id: true,
          description: true,
          date: true,
          time: true,
          latitude: true,
          longitude: true,
          attachments: {
            select: { uri: true },
            take: 3,
          },
        },
        orderBy: { createdAt: 'desc' },
        where: { incidentId: incident.id },
        take: 5,
      });

      this.logger.debug(`Incident ID: ${incident.id}`);

      const votes = await this.prisma.$queryRaw<VoteCountResult[]>`
        SELECT
          COUNT(*) FILTER (WHERE v."type" = 'upvote')::int AS upvote_count,
          COUNT(*) FILTER (WHERE v."type" = 'downvote')::int AS downvote_count
        FROM "Vote" v
        INNER JOIN "Report" r ON v."report_id" = r."id"
        WHERE r."incident_id" = ${incident.id}::uuid
      `;

      return {
        ...incident,
        ...votes[0],
        reports,
      };
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }

  public async getReportsByIncidentId(
    incidentId: string,
  ): Promise<ReportItemResult[]> {
    try {
      return await this.prisma.report.findMany({
        where: { incidentId },
        select: {
          id: true,
          description: true,
          date: true,
          time: true,
          latitude: true,
          longitude: true,
          incident: {
            select: {
              id: true,
              category: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }

  public async getCategories(): Promise<IncidentCategory[]> {
    try {
      return await this.prisma.incidentCategory.findMany({
        orderBy: { name: 'asc' },
      });
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }
}
