import { Injectable, NotFoundException } from '@nestjs/common';
import { getFormattedDate, getTimeString } from '../../utils/date.util';
import {
  CategoryResDto,
  IncidentDetailResDto,
  IncidentResDto,
} from './incident.dto';
import { IncidentRepository } from './incident.repository';
import { ReportPreviewDto } from '../report/report.dto';
import { getFileUrl } from 'src/utils/common.util';
import { AbstractLogger } from '../shared/abstract-logger';
import { ApiService } from 'src/infrastructures/api.service';

@Injectable()
export class IncidentService extends AbstractLogger {
  public constructor(
    private readonly apiService: ApiService,
    private readonly repository: IncidentRepository,
  ) {
    super();
  }

  public async handleGetNearbyIncident(
    latitude: number,
    longitude: number,
  ): Promise<IncidentResDto[]> {
    const incidents = await this.repository.findNearbyIncidents(
      latitude,
      longitude,
    );

    return incidents.map(({ risk_level, ...incident }) => ({
      ...incident,
      riskLevel: risk_level,
    }));
  }

  public async handleGetIncidentDetail(
    id: string,
  ): Promise<IncidentDetailResDto> {
    const incident = await this.repository.findIncidentById(id);

    if (!incident) {
      throw new NotFoundException('insiden tidak ditemukan');
    }

    const reports: ReportPreviewDto[] = [];
    const mediaUrls: string[] = [];

    incident.reports.forEach((report) => {
      reports.push({
        id: report.id,
        description: report.description,
      });

      const urls = report.attachments.map(({ uri }) => getFileUrl(uri));
      mediaUrls.push(...urls);
    });

    const location = await this.apiService.reverseGeocode(
      incident.latitude,
      incident.longitude,
    );

    return {
      id: incident.id,
      category: incident.category,
      status: incident.status,
      riskLevel: incident.risk_level,
      location: location.display_name,
      date: this.getDateRange(incident.date_start, incident.date_end),
      time: this.getTimeRange(incident.time_start, incident.time_end),
      reports,
      mediaUrls,
    };
  }

  public async handleGetIncidentReports(
    id: string,
  ): Promise<ReportPreviewDto[]> {
    const result = await this.repository.getReportsByIncidentId(id);
    return result as ReportPreviewDto[];
  }

  public async handleGetCategories(): Promise<CategoryResDto[]> {
    const result = await this.repository.getCategories();
    return result as CategoryResDto[];
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
