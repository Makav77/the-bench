import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Delete,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

interface S3File extends Express.Multer.File {
  location: string;
  key: string;
}

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: S3File) {
    return {
      originalUrl: file.location,
      cdnUrl: file.location.replace(
        process.env.DO_SPACES_ENDPOINT!,
        process.env.DO_SPACES_CDN!,
      ),
      filename: file.key,
    };
  }

  @Delete(':filename')
  async deleteFile(@Param('filename') filename: string) {
    try {
      await this.uploadService.deleteFile(filename);
      return { message: `File '${filename}' deleted successfully.` };
    } catch (error) {
      throw new HttpException(
        'Failed to delete file: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
