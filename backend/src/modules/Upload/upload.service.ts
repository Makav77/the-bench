import { Injectable } from "@nestjs/common";
import * as AWS from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";

@Injectable()
export class UploadService {
  private s3: AWS.S3;

  constructor() {
    const endpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT!);

    this.s3 = new AWS.S3({
      endpoint,
      accessKeyId: process.env.DO_SPACES_KEY,
      secretAccessKey: process.env.DO_SPACES_SECRET,
      region: process.env.DO_SPACES_REGION,
    });
  }

  getMulterUploader(options?: { folder?: string; maxCount?: number }) {
    const folder = options?.folder ? `${options.folder}/` : "";
    return multer({
      storage: multerS3({
        s3: this.s3,
        bucket: process.env.DO_SPACES_BUCKET!,
        acl: "public-read",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
          const ext = file.originalname.split(".").pop();
          const filename = `${folder}${Date.now()}-${Math.round(
            Math.random() * 1e5
          )}.${ext}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    });
  }

  getMulterOptions(): multer.Options {
    return {
      storage: multerS3({
        s3: this.s3,
        bucket: process.env.DO_SPACES_BUCKET!,
        acl: "public-read",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
          const ext = file.originalname.split(".").pop();
          const filename = `${Date.now()}-${Math.round(
            Math.random() * 1e5
          )}.${ext}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    };
  }

  async deleteFile(filename: string): Promise<void> {
    await this.s3
      .deleteObject({
        Bucket: process.env.DO_SPACES_BUCKET!,
        Key: filename,
      })
      .promise();
  }
}
