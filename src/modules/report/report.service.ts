import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { IReportRepository, ReportRepository } from './report.repository';
import { ReportPreviewDto, ReportReqDto, ReportResDto } from './report.dto';
import { ReportInput } from './report.type';
import { UploadService } from 'src/infrastructures/upload.service';
import { UserJwtPayload } from '../shared/shared.type';
import { getDate, getDateString, getTimeString } from 'src/utils/date.util';
import { SuccessCreateDto } from '../shared/shared.dto';
import { getLocationName } from 'src/utils/api.util';
import { getFileUrl } from 'src/utils/common.util';

@Injectable()
export class ReportService extends BaseService<IReportRepository> {
  public constructor(
    private readonly uploadService: UploadService,
    repository: ReportRepository,
  ) {
    super(repository);
  }

  public async handleGetUserReport(
    user: UserJwtPayload,
  ): Promise<ReportPreviewDto[]> {
    const result = await this.repository.getReportByUserEmail(user.email);
    return result as ReportPreviewDto[];
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
      isEdited: comment.updatedAt !== comment.createdAt,
      user: comment.user,
    }));

    const { latitude, longitude } = result;
    const location = await getLocationName(latitude, longitude);

    const attachments = result.attachments.map(({ uri }) => getFileUrl(uri));

    let upvote = 0;
    let downvote = 0;

    result.votes.forEach((vote) => {
      if (vote.type === 'upvote') upvote++;
      else downvote++;
    });

    return {
      id: result.id,
      description: result.description,
      status: result.status,
      user: result.user,
      date: getDateString(result.date),
      time: getTimeString(result.time, true),
      latitude: latitude,
      longitude: longitude,
      incident,
      comments,
      location,
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
