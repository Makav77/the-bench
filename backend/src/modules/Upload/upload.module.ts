import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { UploadCoreModule } from './upload-core.module';
import { UploadService } from './upload.service';

@Module({
  imports: [
    UploadCoreModule,
    MulterModule.registerAsync({
      imports: [UploadCoreModule],
      inject: [UploadService],
      useFactory: (uploadService: UploadService) => uploadService.getMulterOptions(),
    }),
  ],
  controllers: [UploadController],
  exports: [UploadCoreModule],
})
export class UploadModule {}
