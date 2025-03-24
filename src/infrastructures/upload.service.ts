import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { extname } from 'path';
import { drive_v3, google } from 'googleapis';
import { Readable } from 'stream';
import {
  UPLOAD_DESTINATION,
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
    const name = uuidv4();

    if (UPLOAD_DESTINATION === 'cloud') {
      return await this.uploadToDrive(file, name);
    } else {
      return this.uploadToLocal(file, name);
    }
  }

  private async uploadToDrive(
    file: Express.Multer.File,
    name: string,
  ): Promise<string> {
    try {
      const fileMetadata = {
        name,
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

  private uploadToLocal(file: Express.Multer.File, name: string): string {
    const folderName = `./public/upload/`;

    if (!existsSync(folderName)) {
      mkdirSync(folderName, { recursive: true });
    }

    const filename = `${name}${extname(file.originalname)}`;

    try {
      writeFileSync(folderName + filename, file.buffer);
      return filename;
    } catch (error) {
      throw handleError(error, this.logger);
    }
  }
}
