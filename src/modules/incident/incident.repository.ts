import { Injectable, NotFoundException } from '@nestjs/common';
import {
  IncidentDetailResult,
  IncidentPreviewResult,
  IncidentSelection,
} from './incident.type';
import { BaseRepository } from '../shared/base.repository';
import { handleError } from 'src/utils/common.util';
import { ReportPreviewResult } from '../report/report.type';

export interface IIncidentRepository {
  findNearbyIncidents(
    latitude: number,
    longitude: number,
  ): Promise<IncidentPreviewResult[]>;
  findIncidentById(id: string): Promise<IncidentSelection>;
  getReportsByIncidentId(incidentId: string): Promise<ReportPreviewResult[]>;
}

@Injectable()
export class IncidentRepository
  extends BaseRepository
  implements IIncidentRepository
{
  public async findNearbyIncidents(
    latitude: number,
    longitude: number,
  ): Promise<IncidentPreviewResult[]> {
    try {
      return await this.prisma.$queryRaw<IncidentPreviewResult[]>`
        SELECT
          id,
          risk_level,
          ST_Y(location_point) AS latitude,
          ST_X(location_point) AS longitude
        FROM "Incident"
        WHERE ST_DWithin(
          location_point::geography,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          1000 -- TODO: set radius dynamically based on user zoom level
        )
      `;
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }

  public async findIncidentById(id: string): Promise<IncidentSelection> {
    try {
      const result = await this.prisma.$queryRaw<IncidentDetailResult[]>`
      SELECT
        i.id,
        i.status,
        i.risk_level,
        i.date_start,
        i.date_end,
        i.time_start,
        i.time_end,
        ST_Y(location_point) AS latitude,
        ST_X(location_point) AS longitude,
        ic.name AS category
      FROM "Incident" i
      JOIN "IncidentCategory" ic ON ic.id = i.category_id
      WHERE i.id = ${id}::uuid
    `;

      const incident = result[0];
      if (!incident) {
        throw new NotFoundException('insiden tidak ditemukan');
      }

      const reports = await this.prisma.report.findMany({
        select: {
          id: true,
          description: true,
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
  ): Promise<ReportPreviewResult[]> {
    try {
      return await this.prisma.report.findMany({
        where: { incidentId },
        select: { id: true, description: true },
      });
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }
}
