import { Injectable } from '@nestjs/common';
import { BaseService } from './base.service';
import { getFormattedDate, getTimeString } from '../utils/date.util';
import { getLocationName } from '../utils/api.util';
import { IncidentReport, IncidentResBody } from '../dto/incident.dto';
import { IncidentSelection } from 'src/types/incident.type';

@Injectable()
export class IncidentService extends BaseService {
  public async handleGetIncident(): Promise<IncidentResBody[]> {
    const incidents: IncidentSelection[] = await this.prisma.incident.findMany({
      include: {
        category: {
          select: { name: true },
        },
        reports: {
          select: {
            id: true,
            description: true,
            attachments: {
              select: { uri: true },
            },
          },
        },
      },
    });
    const response: IncidentResBody[] = [];

    for (const incident of incidents) {
      const location = await getLocationName(
        incident.latitude_centroid,
        incident.longitude_centroid,
      );

      const reports: IncidentReport[] = [];
      const mediaUrls: string[] = [];

      incident.reports.forEach((report) => {
        reports.push({
          id: report.id,
          description: report.description,
        });

        mediaUrls.push(
          ...report.attachments.map((attachment) => attachment.uri),
        );
      });

      response.push({
        category: incident.category.name,
        date: this.getDateRange(incident.dateStart, incident.dateEnd),
        time: this.getTimeRange(incident.timeStart, incident.timeEnd),
        riskLevel: incident.riskLevel as string,
        location,
        latitude: incident.latitude_centroid,
        longitude: incident.longitude_centroid,
        status: incident.status as string,
        reports,
        mediaUrls,
      });
    }

    return response;
  }

  private getDateRange(dateStart: Date, dateEnd: Date) {
    const formattedDateStart = getFormattedDate(dateStart);
    const formattedDateEnd = getFormattedDate(dateEnd);

    if (formattedDateStart === formattedDateEnd) return formattedDateStart;
    return `${formattedDateStart} ~ ${formattedDateEnd}`;
  }

  private getTimeRange(timeStart: Date, timeEnd: Date) {
    const timeStartString = getTimeString(timeStart, true);
    const timeEndString = getTimeString(timeEnd, true);

    if (timeStartString === timeEndString) return timeStartString;
    return `${timeStartString} ~ ${timeEndString}`;
  }
}
