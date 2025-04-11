import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { handleError } from 'src/utils/common.util';
import {
  RelatedIncident,
  ReportDetailResult,
  ReportInput,
  ReportPreviewResult,
  ReportResult,
} from './report.type';
import { getDate, getDateString, getTimeString } from 'src/utils/date.util';

export interface IReportRepository {
  getReportByUserEmail(email: string): Promise<ReportPreviewResult[]>;
  getReportById(id: string): Promise<ReportDetailResult | null>;
  createReport(
    incident: RelatedIncident,
    report: ReportInput,
  ): Promise<ReportResult>;
  findRelatedIncident(report: ReportInput): Promise<RelatedIncident | null>;
  createIncident(report: ReportInput): Promise<RelatedIncident>;
  checkReportEligibility(
    userEmail: string,
    incidentId: string,
    date: Date,
  ): Promise<boolean>;
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

  public async getReportByUserEmail(
    email: string,
  ): Promise<ReportPreviewResult[]> {
    return await this.prisma.report.findMany({
      where: { userEmail: email },
      select: { id: true, description: true },
    });
  }

  public async getReportById(id: string): Promise<ReportDetailResult | null> {
    this.logger.debug(`id: ${id}`);
    return await this.prisma.report.findFirst({
      where: { id },
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
        user: {
          select: {
            name: true,
            profilePhoto: true,
            reputation: true,
          },
        },
        attachments: { select: { uri: true } },
        votes: { select: { type: true } },
        comments: {
          select: {
            id: true,
            comment: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                name: true,
                profilePhoto: true,
                reputation: true,
              },
            },
          },
        },
      },
    });
  }

  public async createReport(
    incident: RelatedIncident,
    report: ReportInput,
  ): Promise<ReportResult> {
    try {
      const {
        userEmail,
        description,
        latitude,
        longitude,
        date,
        time,
        mediaUrls,
      } = report;

      return await this.prisma.$transaction(async (tx) => {
        const report = await tx.report.create({
          data: {
            userEmail,
            incidentId: incident.id,
            description,
            latitude,
            longitude,
            date: getDate(date),
            time: getDate(time),
            attachments: {
              create: [
                ...mediaUrls.map<{ uri: string }>((uri) => ({
                  uri,
                })),
              ],
            },
          },
          select: {
            id: true,
            date: true,
            time: true,
            latitude: true,
            longitude: true,
          },
        });

        await this.updateIncident(tx, incident, report);

        return report;
      });
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }

  public async checkReportEligibility(
    userEmail: string,
    incidentId: string,
    date: Date,
  ): Promise<boolean> {
    try {
      const userReport = await this.prisma.report.findFirst({
        where: {
          userEmail,
          incidentId,
          date,
        },
        select: { id: true },
      });

      return userReport == null;
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }

  public async findRelatedIncident(
    report: ReportInput,
  ): Promise<RelatedIncident | null> {
    try {
      const { categoryId, latitude, longitude, date, time } = report;

      const result = await this.prisma.$queryRawUnsafe<RelatedIncident[]>(`
        SELECT
          i."id"::text,
          i."date_start",
          i."date_end",
          i."time_start",
          i."time_end"
        FROM "Incident" i
        JOIN "IncidentCategory" ic ON ic."id" = i."category_id"
        WHERE ic."id" = ${categoryId}
          AND ST_Intersects(
            ST_Expand(i."location_area", ${this.RADIUS_METERS}),
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), ${this.SRID_WGS84})::geometry
          )
          AND DATE '${date}' BETWEEN (i."date_start" - INTERVAL '${this.DATE_TOLERANCE_DAYS} day') AND (i."date_end" + INTERVAL '${this.DATE_TOLERANCE_DAYS} day')
          AND TIME '${time}' BETWEEN (i."time_start" - INTERVAL '${this.TIME_TOLERANCE_HOURS} hour') AND (i."time_end" + INTERVAL '${this.TIME_TOLERANCE_HOURS} hour')
        LIMIT 1
      `);

      return result.length != 0 ? result[0] : null;
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }

  public async createIncident(report: ReportInput): Promise<RelatedIncident> {
    try {
      const { categoryId, latitude, longitude, date, time } = report;

      const result = await this.prisma.$queryRawUnsafe<RelatedIncident[]>(`
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
          'active',
          '${date}',
          '${date}',
          '${time}',
          '${time}',
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
        RETURNING id, date_start, date_end, time_start, time_end;
      `);

      const incident = result[0];
      if (!incident) {
        throw new Error('Failed to create incident');
      }

      return incident;
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }

  private async updateIncident(
    tx: Prisma.TransactionClient,
    incident: RelatedIncident,
    report: ReportResult,
  ) {
    let data = '';

    if (report.date < incident.date_start)
      data += `date_start = '${getDateString(report.date)}', `;
    else if (report.date > incident.date_end)
      data += `date_end = '${getDateString(report.date)}', `;

    if (report.time < incident.time_start)
      data += `time_start = '${getTimeString(report.time, true)}', `;
    else if (report.time > incident.time_end)
      data += `time_end = '${getTimeString(report.time, true)}', `;

    const lat = report.latitude;
    const lon = report.longitude;

    const [{ contained }] = await tx.$queryRawUnsafe<{ contained: boolean }[]>(`
      SELECT ST_Contains(location_area, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)) as contained
        FROM "Incident"
      WHERE id = '${incident.id}'
    `);

    if (!contained) {
      const point = `ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)`;
      const buffered = `ST_Buffer(${point}, 0.0001)`;
      const newArea = `ST_Envelope(ST_Union(location_area, ${buffered}))`;

      data += `location_area = ${newArea}, `;
      data += `location_point = ST_Centroid(${newArea}), `;
    }

    if (data == '') return;
    data = data.replace(/, $/, '');

    await tx.$executeRawUnsafe(`
      UPDATE "Incident" SET ${data}
      WHERE id = '${incident.id}'
    `);

    this.logger.debug(`Incident with id ${incident.id} updated: ${data}`);
  }
}
