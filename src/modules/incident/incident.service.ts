import { Injectable, NotFoundException } from '@nestjs/common';
import { getFormattedDate, getTimeString } from '../../utils/date.util';
import {
  CategoryResDto,
  IncidentDetailResDto,
  IncidentResDto,
} from './incident.dto';
import { IncidentRepository } from './incident.repository';
import { ReportItemDto } from '../report/report.dto';
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
    const result: IncidentResDto[] = [];

    for (const incident of incidents) {
      const location = await this.apiService.reverseGeocode(
        incident.latitude,
        incident.longitude,
      );

      result.push({
        id: incident.id,
        date: this.getDateRange(incident.date_start, incident.date_end, true),
        time: this.getTimeRange(incident.time_start, incident.time_end),
        status: incident.status,
        latitude: incident.latitude,
        longitude: incident.longitude,
        location: location.display_name,
        category: incident.category,
        radius: incident.radius,
        riskLevel: incident.risk_level,
      });
    }

    return result;
  }

  public async handleGetIncidentDetail(
    id: string,
  ): Promise<IncidentDetailResDto> {
    const incident = await this.repository.findIncidentById(id);

    if (!incident) {
      throw new NotFoundException('Insiden tidak ditemukan');
    }

    const reports: ReportItemDto[] = [];
    const mediaUrls: string[] = [];

    for (const report of incident.reports) {
      const location = await this.apiService.reverseGeocode(
        report.latitude,
        report.longitude,
      );

      reports.push({
        id: report.id,
        description: report.description,
        date: getFormattedDate(report.date),
        time: getTimeString(report.time, true),
        status: report.status,
        location: location.display_name,
        category: incident.category,
      });

      const urls = report.attachments.map(({ uri }) => getFileUrl(uri));
      mediaUrls.push(...urls);
    }

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

  public async handleGetIncidentReports(id: string): Promise<ReportItemDto[]> {
    const reports = await this.repository.getReportsByIncidentId(id);
    const result: ReportItemDto[] = [];

    for (const report of reports) {
      const location = await this.apiService.reverseGeocode(
        report.latitude,
        report.longitude,
      );

      result.push({
        id: report.id,
        description: report.description,
        date: getFormattedDate(report.date),
        time: getTimeString(report.time, true),
        status: report.status,
        location: location.display_name,
        category: report.incident.category.name,
      });
    }

    return result;
  }

  public async handleGetCategories(): Promise<CategoryResDto[]> {
    const result = await this.repository.getCategories();
    return result as CategoryResDto[];
  }

  private getDateRange(
    dateStart: Date,
    dateEnd: Date,
    simpleDate: boolean = false,
  ) {
    const formattedDateStart = getFormattedDate(dateStart, simpleDate);
    const formattedDateEnd = getFormattedDate(dateEnd, simpleDate);

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
