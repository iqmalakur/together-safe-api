import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { handleError } from 'src/utils/common.util';
import {
  ReportRelatedIncident,
  ReportDetailResult,
  ReportInput,
  ReportItemResult,
  ReportResult,
} from './report.type';
import { getDate, getDateString, getTimeString } from 'src/utils/date.util';

@Injectable()
export class ReportRepository extends BaseRepository {
  public async getReportByUserEmail(
    email: string,
  ): Promise<ReportItemResult[]> {
    return await this.prisma.report.findMany({
      where: { userEmail: email },
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
      orderBy: { createdAt: 'desc' },
    });
  }

  public async getReportById(id: string): Promise<ReportDetailResult | null> {
    return await this.prisma.report.findFirst({
      where: { id },
      select: {
        id: true,
        description: true,
        isAnonymous: true,
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
            email: true,
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
                email: true,
                name: true,
                profilePhoto: true,
                reputation: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  public async checkCategory(categoryId: number): Promise<boolean> {
    try {
      const result = await this.prisma.incidentCategory.findFirst({
        where: { id: categoryId },
        select: { id: true },
      });
      return result != null;
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }

  public async createReport(
    incident: ReportRelatedIncident,
    report: ReportInput,
  ): Promise<ReportResult> {
    try {
      const {
        isAnonymous,
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
            isAnonymous,
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
  ): Promise<ReportRelatedIncident | null> {
    try {
      const { categoryId, latitude, longitude, date, time } = report;

      const result = await this.prisma.$queryRawUnsafe<
        ReportRelatedIncident[]
      >(`
        SELECT
          i."id"::text,
          i."radius",
          i."date_start",
          i."date_end",
          i."time_start",
          i."time_end"
        FROM "Incident" i
        JOIN "IncidentCategory" ic ON ic."id" = i."category_id"
        WHERE ic."id" = ${categoryId}
          AND ST_DWithin(
            i."location"::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
            i."radius" + 25
          )
          AND DATE '${date}' BETWEEN (i."date_start" - INTERVAL '7 day') AND (i."date_end" + INTERVAL '7 day')
          AND TIME '${time}' BETWEEN (i."time_start" - INTERVAL '5 hour') AND (i."time_end" + INTERVAL '5 hour')
        LIMIT 1
      `);

      return result.length != 0 ? result[0] : null;
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }

  public async createIncident(
    report: ReportInput,
  ): Promise<ReportRelatedIncident> {
    try {
      const { categoryId, latitude, longitude, date, time } = report;

      const result = await this.prisma.$queryRawUnsafe<
        ReportRelatedIncident[]
      >(`
        INSERT INTO "Incident" (
          category_id,
          risk_level,
          status,
          date_start,
          date_end,
          time_start,
          time_end,
          radius,
          location
        )
        VALUES (
          ${categoryId},
          'medium',
          'active',
          '${date}',
          '${date}',
          '${time}',
          '${time}',
          10,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
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
    incident: ReportRelatedIncident,
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
    const reportPoint = `ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography`;

    const [{ distance }] = await tx.$queryRawUnsafe<{ distance: number }[]>(`
      SELECT ST_Distance(
        i."location"::geography,
        ${reportPoint}
      ) as distance
      FROM "Incident" i
      WHERE i."id" = '${incident.id}'
    `);

    if (distance > incident.radius) {
      const newRadius = Math.ceil(distance);
      data += `radius = ${newRadius}, `;
    }

    if (data === '') return;

    await tx.$executeRawUnsafe(`
      UPDATE "Incident"
        SET ${data} updated_at = NOW()
      WHERE id = '${incident.id}'
    `);

    this.logger.debug(`Incident with id ${incident.id} updated: ${data}`);
  }
}
