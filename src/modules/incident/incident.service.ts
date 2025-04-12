import { Injectable } from '@nestjs/common';
import { getFormattedDate, getTimeString } from '../../utils/date.util';
import { getLocationName } from '../../utils/api.util';
import { IncidentResDto } from './incident.dto';
import { IncidentSelection } from './incident.type';
import { IIncidentRepository, IncidentRepository } from './incident.repository';
import { BaseService } from '../shared/base.service';
import { ReportPreviewDto } from '../report/report.dto';

@Injectable()
export class IncidentService extends BaseService<IIncidentRepository> {
  public constructor(repository: IncidentRepository) {
    super(repository);
  }

  public async handleGetNearbyIncident(
    latitude: number,
    longitude: number,
  ): Promise<IncidentResDto[]> {
    const incidents: IncidentSelection[] =
      await this.repository.findNearbyIncidents(latitude, longitude);
    const response: IncidentResDto[] = [];

    for (const incident of incidents) {
      const location = await getLocationName(
        incident.latitude,
        incident.longitude,
      );

      const reports: ReportPreviewDto[] = [];
      const mediaUrls: string[] = [];

      incident.reports.forEach((report) => {
        reports.push({
          id: report.id,
          description: report.description,
        });

        mediaUrls.push(...report.attachments);
      });

      response.push({
        category: incident.category,
        date: this.getDateRange(incident.date_start, incident.date_end),
        time: this.getTimeRange(incident.time_start, incident.time_end),
        riskLevel: incident.risk_level,
        location,
        latitude: incident.latitude,
        longitude: incident.longitude,
        status: incident.status,
        reports,
        mediaUrls,
      });
    }

    return response;
  }

  public async handleGetIncidentReports(
    id: string,
  ): Promise<ReportPreviewDto[]> {
    const result = await this.repository.getReportsByIncidentId(id);
    return result as ReportPreviewDto[];
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
