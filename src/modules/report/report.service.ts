import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReportRepository } from './report.repository';
import { ReportItemDto, ReportReqDto, ReportResDto } from './report.dto';
import { ReportInput, ReportRelatedIncident } from './report.type';
import { UploadService } from '../../infrastructures/upload.service';
import { UserJwtPayload } from '../shared/shared.type';
import {
  getDate,
  getFormattedDate,
  getTimeString,
} from '../../utils/date.util';
import { SuccessCreateDto } from '../shared/shared.dto';
import { getFileUrl, getFileUrlOrNull } from '../../utils/common.util';
import { AbstractLogger } from '../shared/abstract-logger';
import { ApiService } from '../../infrastructures/api.service';
import { RiskLevel } from '@prisma/client';

@Injectable()
export class ReportService extends AbstractLogger {
  public constructor(
    private readonly apiService: ApiService,
    private readonly uploadService: UploadService,
    private readonly repository: ReportRepository,
  ) {
    super();
  }

  public async handleGetUserReport(
    user: UserJwtPayload,
  ): Promise<ReportItemDto[]> {
    const reports = await this.repository.getReportByUserEmail(user.email);
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
        location: location.display_name,
        category: report.incident.category.name,
      });
    }

    return result;
  }

  public async handleGetReport(id: string): Promise<ReportResDto> {
    const result = await this.repository.getReportById(id);

    if (!result) {
      throw new NotFoundException('Laporan tidak ditemukan');
    }

    const incident = {
      id: result.incident.id,
      category: result.incident.category.name,
    };

    const comments = result.comments.map((comment) => ({
      id: comment.id,
      comment: comment.comment,
      createdAt: comment.createdAt,
      isEdited: comment.updatedAt.getTime() !== comment.createdAt.getTime(),
      user: {
        ...comment.user,
        profilePhoto: getFileUrlOrNull(comment.user.profilePhoto),
      },
    }));

    const { latitude, longitude } = result;
    const location = await this.apiService.reverseGeocode(latitude, longitude);

    const attachments = result.attachments.map(({ uri }) => getFileUrl(uri));

    let upvote = 0;
    let downvote = 0;

    result.votes.forEach((vote) => {
      if (vote.type === 'upvote') upvote++;
      else if (vote.type === 'downvote') downvote++;
    });

    return {
      id: result.id,
      description: result.description,
      isAnonymous: result.isAnonymous,
      user: {
        ...result.user,
        profilePhoto: getFileUrlOrNull(result.user.profilePhoto),
      },
      date: getFormattedDate(result.date),
      time: getTimeString(result.time, true),
      latitude: latitude,
      longitude: longitude,
      incident,
      comments,
      location: location.display_name,
      upvote,
      downvote,
      attachments,
    };
  }

  public async handleCreateReport(
    user: UserJwtPayload,
    data: ReportReqDto,
  ): Promise<SuccessCreateDto> {
    const { description, date, time, location, media } = data;
    const categoryId = parseInt(data.categoryId);
    const isAnonymous = data.isAnonymous.toLowerCase() === 'true';
    const splittedLocation = location.split(',');
    const latitude = parseFloat(splittedLocation[0]);
    const longitude = parseFloat(splittedLocation[1]);

    const reportInput: ReportInput = {
      categoryId,
      isAnonymous,
      description,
      date,
      time,
      latitude,
      longitude,
      userEmail: user.email,
      mediaUrls: [],
    };

    const category = await this.repository.getCategory(reportInput.categoryId);

    if (!category) {
      throw new NotFoundException(['Kategori tidak ditemukan']);
    }

    let relatedIncident =
      await this.repository.findRelatedIncident(reportInput);

    if (!relatedIncident) {
      relatedIncident = await this.repository.createIncident(
        reportInput,
        category.minRiskLevel,
      );
      this.logger.info(`New incident created with ID ${relatedIncident.id}`);
    } else {
      const isEligible = await this.repository.checkReportEligibility(
        user.email,
        relatedIncident.id,
        getDate(date),
      );

      if (!isEligible) {
        throw new ConflictException(
          `Laporan serupa telah anda kirim tanggal ${date}`,
        );
      }
    }

    reportInput.mediaUrls = await this.uploadService.uploadFiles(media);

    const result = await this.repository.createReport(
      relatedIncident,
      reportInput,
    );

    this.checkIncidentRisk(relatedIncident);

    return {
      id: result.id,
      message: 'Berhasil membuat laporan insiden',
    };
  }

  private async checkIncidentRisk(incident: ReportRelatedIncident) {
    const reportCount = await this.repository.getReportCount(incident.id);

    if (reportCount < 4 && incident.risk_level !== incident.min_risk_level) {
      await this.repository.updateIncidentRiskLevel(
        incident.id,
        incident.min_risk_level as RiskLevel,
      );
    } else if (
      reportCount >= 4 &&
      incident.risk_level !== incident.max_risk_level
    ) {
      await this.repository.updateIncidentRiskLevel(
        incident.id,
        incident.max_risk_level as RiskLevel,
      );
    }
  }
}
