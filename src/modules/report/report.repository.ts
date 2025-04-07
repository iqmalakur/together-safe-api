import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { handleError } from 'src/utils/common.util';
import { RelatedIncident, ReportInput } from './report.type';
import { Report as PrismaReport } from '@prisma/client';

export interface IReportRepository {
  createReport(userEmail: string, report: ReportInput): Promise<PrismaReport>;
}

@Injectable()
export class ReportRepository
  extends BaseRepository
  implements IReportRepository
{
  private readonly SRID_WGS84 = 4326; // Standard GPS coordinate system
  private readonly SRID_WEB_MERCATOR = 3857; // Used for Web mapping (meters)
  private readonly RADIUS_METERS = 100; // Radius from centroid
  private readonly DATE_TOLERANCE_DAYS = 1; // Date tolerance before/after
  private readonly TIME_TOLERANCE_HOURS = 1; // Time tolerance before/after

  public async createReport(
    userEmail: string,
    report: ReportInput,
  ): Promise<PrismaReport> {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        const relatedIncident = await this.findRelatedIncident(report);
        let incidentId = relatedIncident?.id;

        if (!incidentId) {
          incidentId = await this.createIncident(report);
          this.logger.info(`New incident created with ID ${incidentId}`);
        }

        const { description, latitude, longitude, date, time } = report;
        return await prisma.report.create({
          data: {
            userEmail,
            incidentId,
            description,
            latitude,
            longitude,
            date,
            time,
          },
        });
      });
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }

  private async findRelatedIncident(
    report: ReportInput,
  ): Promise<RelatedIncident | null> {
    const { categoryId, latitude, longitude, date, time } = report;

    const result = await this.prisma.$queryRaw<RelatedIncident[]>`
      SELECT
        i."id"::text,
        i."status",
        ic."name" AS category
      FROM "Incident" i
      JOIN "IncidentCategory" ic ON ic."id" = i."category_id"
      WHERE ic."id" = ${categoryId}
        AND ST_DWithin(
          i."location_point",
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), ${this.SRID_WGS84})::geography,
          ${this.RADIUS_METERS}
        )
        AND DATE ${date} BETWEEN (i."date_start" - INTERVAL '${this.DATE_TOLERANCE_DAYS} day') AND (i."date_end" + INTERVAL '${this.DATE_TOLERANCE_DAYS} day')
        AND TIME ${time} BETWEEN (i."time_start" - INTERVAL '${this.TIME_TOLERANCE_HOURS} hour') AND (i."time_end" + INTERVAL '${this.TIME_TOLERANCE_HOURS} hour')
      LIMIT 1
    `;

    return result.length != 0 ? result[0] : null;
  }

  private async createIncident(report: ReportInput): Promise<string> {
    const { categoryId, latitude, longitude, date, time } = report;

    const insertResult = await this.prisma.$queryRaw<{ id: string }[]>`
      INSERT INTO "Incident" (
        category_id,
        risk_level,
        status,
        date_start,
        date_end,
        time_start,
        time_end,
        location_point,
        location_area
      )
      VALUES (
        ${categoryId},
        'medium',
        'pending',
        ${date},
        ${date},
        ${time},
        ${time},
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), ${this.SRID_WGS84}),
        ST_Transform(
          ST_Envelope(
            ST_Buffer(
              ST_Transform(
                ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), ${this.SRID_WGS84}),
                ${this.SRID_WEB_MERCATOR}
              ),
              ${this.RADIUS_METERS}
            )
          ),
          ${this.SRID_WGS84}
        )
      )
      RETURNING id;
    `;

    const incidentId = insertResult[0]?.id;
    if (!incidentId) {
      throw new Error('Failed to create incident');
    }

    return incidentId;
  }
}
