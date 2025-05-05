import { Injectable } from '@nestjs/common';
import { IncidentResult, IncidentSelection } from './incident.type';
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
        WHERE status = 'active' AND
          ST_DWithin(
            location::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
            15000
          )
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
          status: true,
          latitude: true,
          longitude: true,
          attachments: {
            select: { uri: true },
            take: 3,
          },
        },
        where: { incidentId: incident.id },
        take: 5,
      });

      return {
        ...incident,
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
          status: true,
          latitude: true,
          longitude: true,
          incident: {
            select: {
              id: true,
              category: { select: { name: true } },
            },
          },
        },
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
