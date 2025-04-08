import { drive_v3, google } from 'googleapis';
import { Readable } from 'stream';
import {
  GOOGLE_API_KEY_FILE,
  GOOGLE_DRIVE_FOLDER_ID,
} from '../config/app.config';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { handleError } from '../utils/common.util';
import { LoggerUtil } from '../utils/logger.util';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly logger: LoggerUtil;
  private readonly drive: drive_v3.Drive;

  public constructor() {
    this.logger = new LoggerUtil(this.constructor.name);

    this.drive = google.drive({
      version: 'v3',
      auth: new google.auth.GoogleAuth({
        keyFile: `./${GOOGLE_API_KEY_FILE}`,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      }),
    });
  }

  public async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      const fileMetadata = {
        name: uuidv4(),
        parents: [GOOGLE_DRIVE_FOLDER_ID],
      };

      const media = {
        mimeType: file.mimetype,
        body: Readable.from(file.buffer),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
      });

      const fileId = response.data.id;

      if (!fileId) {
        this.logger.debug('file id tidak tersedia');
        throw new InternalServerErrorException();
      }

      return fileId;
    } catch (error) {
      throw handleError(error, this.logger);
    }
  }

  public async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file));
    const fileIds = await Promise.all(uploadPromises);
    return fileIds;
  }
}
