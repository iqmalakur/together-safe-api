import { ConflictException, Injectable } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { IReportRepository, ReportRepository } from './report.repository';
import { ReportReqDto, ReportResDto } from './report.dto';
import { ReportInput } from './report.type';
import { UploadService } from 'src/infrastructures/upload.service';
import { UserJwtPayload } from '../shared/shared.type';
import { getLocationName } from 'src/utils/api.util';
import { getDate } from 'src/utils/date.util';

@Injectable()
export class ReportService extends BaseService<IReportRepository> {
  public constructor(
    private readonly uploadService: UploadService,
    repository: ReportRepository,
  ) {
    super(repository);
  }

  public async handleCreateReport(
    user: UserJwtPayload,
    data: ReportReqDto,
  ): Promise<ReportResDto> {
    const { categoryId, description, date, time, location, media } = data;

    const splittedLocation = location.split(',');
    const latitude = parseFloat(splittedLocation[0]);
    const longitude = parseFloat(splittedLocation[1]);

    const reportInput: ReportInput = {
      categoryId,
      description,
      date,
      time,
      latitude,
      longitude,
      userEmail: user.email,
      incidentId: '',
      mediaUrls: [],
    };

    const relatedIncident =
      await this.repository.findRelatedIncident(reportInput);
    let incidentId = relatedIncident?.id;

    if (!incidentId) {
      incidentId = await this.repository.createIncident(reportInput);
      this.logger.info(`New incident created with ID ${incidentId}`);
    } else {
      const isEligible = await this.repository.checkReportEligibility(
        user.email,
        incidentId,
        getDate(date),
      );

      if (!isEligible) {
        throw new ConflictException('Laporan serupa telah kamu kirim hari ini');
      }
    }

    reportInput.incidentId = incidentId;
    reportInput.mediaUrls = await this.uploadService.uploadFiles(media);

    const result = await this.repository.createReport(reportInput);

    return {
      id: result.id,
      description: reportInput.description,
      status: result.status,
      date: reportInput.date,
      time: reportInput.time,
      location: await getLocationName(
        reportInput.latitude,
        reportInput.longitude,
      ),
      attachments: reportInput.mediaUrls,
      user: {
        email: user.email,
        name: user.name,
        profilePhoto: user.profilePhoto,
      },
    };
  }
}
