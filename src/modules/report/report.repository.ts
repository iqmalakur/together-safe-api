import { IncidentCategory, Prisma, RiskLevel } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { handleError } from '../../utils/common.util';
import {
  ReportRelatedIncident,
  ReportDetailResult,
  ReportInput,
  ReportItemResult,
  ReportResult,
} from './report.type';
import { getDate, getDateString, getTimeString } from '../../utils/date.util';
import { getUpdatedTimeRange } from '../../utils/time.util';

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
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
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

      const result = await this.prisma.$queryRaw<ReportRelatedIncident[]>`
        SELECT
          i.id,
          i.radius,
          ic.min_risk_level AS min_risk_level,
          ic.max_risk_level AS max_risk_level,
          i.risk_level,
          i.date_start,
          i.date_end,
          i.time_start,
          i.time_end
        FROM "Incident" i
        JOIN "IncidentCategory" ic ON ic.id = i.category_id
        WHERE ic.id = ${categoryId}
          AND ST_DWithin(
            i.location::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
            i.radius + 50
          )
          AND ${date}::DATE BETWEEN (i.date_start - ic.ttl_date) AND (i.date_end + ic.ttl_date)
          AND (
            (
              i.time_start <= i.time_end AND
              ${time}::TIME BETWEEN (i.time_start - ic.ttl_time) AND (i.time_end + ic.ttl_time)
            )
			      OR
            (
              i.time_start - ic.ttl_time > i.time_end + ic.ttl_time
              AND (
                ${time}::TIME >= (i.time_start - ic.ttl_time)
                OR
                ${time}::TIME <= (i.time_end + ic.ttl_time)
              )
            )
		      )
        LIMIT 1
      `;

      return result.length != 0 ? result[0] : null;
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }

  public async getCategory(
    categoryId: number,
  ): Promise<IncidentCategory | null> {
    try {
      const result = await this.prisma.incidentCategory.findFirst({
        where: { id: categoryId },
      });
      return result;
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }

  public async createIncident(
    report: ReportInput,
    riskLevel: string,
  ): Promise<ReportRelatedIncident> {
    try {
      const { categoryId, latitude, longitude, date, time } = report;

      const result = await this.prisma.$queryRaw<ReportRelatedIncident[]>`
        INSERT INTO "Incident" (
          category_id,
          risk_level,
          date_start,
          date_end,
          time_start,
          time_end,
          radius,
          location
        )
        VALUES (
          ${categoryId},
          ${riskLevel}::"RiskLevel",
          ${date}::DATE,
          ${date}::DATE,
          ${time}::TIME,
          ${time}::TIME,
          10,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
        )
        RETURNING id, date_start, date_end, time_start, time_end;
      `;

      const incident = result[0];
      if (!incident) {
        throw new Error('Failed to create incident');
      }

      return incident;
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }

  public async getReportCount(incidentId: string): Promise<number> {
    try {
      return await this.prisma.report.count({ where: { incidentId } });
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }

  public async updateIncidentRiskLevel(
    incidentId: string,
    riskLevel: RiskLevel,
  ) {
    try {
      await this.prisma.incident.update({
        where: { id: incidentId },
        data: { riskLevel },
      });
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

    const timeUpdate = getUpdatedTimeRange(
      incident.time_start,
      incident.time_end,
      report.time,
    );

    if (timeUpdate.updateStart)
      data += `time_start = '${getTimeString(timeUpdate.updateStart, true)}', `;
    if (timeUpdate.updateEnd)
      data += `time_end = '${getTimeString(timeUpdate.updateEnd, true)}', `;

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
