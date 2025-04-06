import { Injectable } from '@nestjs/common';
import { IncidentSelection, RawIncidentRow } from './incident.type';
import { BaseRepository } from '../shared/base.repository';

export interface IIncidentRepository {
  getIncidents(): Promise<IncidentSelection[]>;
}

@Injectable()
export class IncidentRepository
  extends BaseRepository
  implements IIncidentRepository
{
  public async getIncidents(): Promise<IncidentSelection[]> {
    const incidents = await this.prisma.$queryRaw<RawIncidentRow[]>`
      SELECT
        i."id"::text,
        i."status",
        i."risk_level",
        i."date_start",
        i."date_end",
        i."time_start",
        i."time_end",
        ST_Y(location_point) AS latitude,
        ST_X(location_point) AS longitude,
        ic."name" AS category
      FROM "Incident" i
      JOIN "IncidentCategory" ic ON ic."id" = i."category_id"
      -- WHERE ST_DWithin(
      --   i.location_point::geography,
      --   ST_SetSRID(ST_MakePoint(\${userLng}, \${userLat}), 4326)::geography,
      --   \${radiusMeters}
      -- )
    `;

    const incidentIds = incidents.map((incident) => incident.id);
    const reports = await this.prisma.report.findMany({
      select: {
        id: true,
        incidentId: true,
        description: true,
        attachments: { select: { uri: true } },
      },
      where: { incidentId: { in: incidentIds } },
    });

    const groupedReports: Record<string, IncidentSelection['reports']> = {};

    for (const report of reports) {
      if (!groupedReports[report.incidentId]) {
        groupedReports[report.incidentId] = [];
      }
      groupedReports[report.incidentId].push({
        id: report.id,
        incidentId: report.incidentId,
        description: report.description,
        attachments: report.attachments.map((a) => a.uri),
      });
    }

    return incidents.map((incident) => ({
      ...incident,
      reports: groupedReports[incident.id] ?? [],
    }));
  }
}
