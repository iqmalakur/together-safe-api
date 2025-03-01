import { Injectable } from '@nestjs/common';
import { BaseService } from './base.service';
import { getFormattedDate, getTimeString } from 'src/utils/date.util';
import { getLocationName } from 'src/utils/api.util';
import { IncidentResBody } from 'src/dto/incident.dto';

@Injectable()
export class IncidentService extends BaseService {
  public async handleGetIncident(): Promise<IncidentResBody[]> {
    const incidents = await this.prisma.incident.findMany();
    const response: IncidentResBody[] = [];

    for (const incident of incidents) {
      const location = await getLocationName(
        incident.latitude_centroid,
        incident.longitude_centroid,
      );

      response.push({
        category: 'pembegalan',
        date: this.getDateRange(incident.dateStart, incident.dateEnd),
        time: this.getTimeRange(incident.timeStart, incident.timeEnd),
        riskLevel: incident.riskLevel as string,
        location,
        latitude: incident.latitude_centroid,
        longitude: incident.longitude_centroid,
        status: incident.status as string,
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
