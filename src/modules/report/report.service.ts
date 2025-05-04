import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReportRepository } from './report.repository';
import { ReportItemDto, ReportReqDto, ReportResDto } from './report.dto';
import { ReportInput } from './report.type';
import { UploadService } from 'src/infrastructures/upload.service';
import { UserJwtPayload } from '../shared/shared.type';
import { getDate, getDateString, getTimeString } from 'src/utils/date.util';
import { SuccessCreateDto } from '../shared/shared.dto';
import { getFileUrl, getFileUrlOrNull } from 'src/utils/common.util';
import { AbstractLogger } from '../shared/abstract-logger';
import { ApiService } from 'src/infrastructures/api.service';

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
        date: getDateString(report.date),
        time: getTimeString(report.time, true),
        status: report.status,
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
      status: result.status,
      user: {
        ...result.user,
        profilePhoto: getFileUrlOrNull(result.user.profilePhoto),
      },
      date: getDateString(result.date),
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
    const { categoryId, description, date, time, location, media } = data;

    const isCategoryExists = await this.repository.checkCategory(categoryId);
    if (!isCategoryExists) {
      throw new BadRequestException('kategori tidak valid');
    }

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
      mediaUrls: [],
    };

    let relatedIncident =
      await this.repository.findRelatedIncident(reportInput);

    if (!relatedIncident) {
      relatedIncident = await this.repository.createIncident(reportInput);
      this.logger.info(`New incident created with ID ${relatedIncident.id}`);
    } else {
      const isEligible = await this.repository.checkReportEligibility(
        user.email,
        relatedIncident.id,
        getDate(date),
      );

      if (!isEligible) {
        throw new ConflictException('Laporan serupa telah anda kirim hari ini');
      }
    }

    reportInput.mediaUrls = await this.uploadService.uploadFiles(media);

    const result = await this.repository.createReport(
      relatedIncident,
      reportInput,
    );

    return {
      id: result.id,
      message: 'Berhasil membuat laporan insiden',
    };
  }
}
