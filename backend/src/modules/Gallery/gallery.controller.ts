import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Req,
  DefaultValuePipe,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { GalleryService } from "./gallery.service";
import { CreateGalleryItemDTO } from "./dto/create-gallery-item.dto";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";
import { GalleryItem } from "./entities/gallery-item.entity";
import { User } from "../Users/entities/user.entity";
import { RequiredPermission } from "../Permissions/decorator/require-permission.decorator";
import { PermissionGuard } from "../Permissions/guards/permission.guard";
import { IrisGuard } from "../Auth/guards/iris.guard";
import { RequestWithResource } from "../Utils/request-with-resource.interface";
import { Resource } from "../Utils/resource.decorator";
import { UploadService } from "../Upload/upload.service";

interface S3File extends Express.Multer.File {
  location: string;
  key: string;
}

@Controller("gallery")
export class GalleryController {
  constructor(
    private readonly galleryService: GalleryService,
    private readonly uploadService: UploadService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAllGalleryItems(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(30), ParseIntPipe) limit: number,
    @Req() req: RequestWithResource<GalleryItem>
  ): Promise<{
    data: GalleryItem[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    const user = req.user as User;
    return this.galleryService.findAllGalleryItems(page, limit, user);
  }

  @UseGuards(JwtAuthGuard, IrisGuard)
  @Get(":id")
  async findOneGalleryItem(
    @Resource() galleryItem: GalleryItem
  ): Promise<GalleryItem> {
    return galleryItem;
  }

  @RequiredPermission("publish_gallery")
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Post()
  async createGalleryItem(
    @UploadedFile() file: S3File,
    @Body() createGalleryItemDTO: CreateGalleryItemDTO,
    @Req() req: RequestWithResource<GalleryItem>,
    @Res() res: Response
  ): Promise<void> {
    const user = req.user as User;

    const multerUpload = this.uploadService
      .getMulterUploader({ folder: "gallery" })
      .single("url");

    multerUpload(req, res, async (err: any) => {
      if (err) {
        console.error("Multer error:", err);
        res.status(400).json({ message: "Multer error: " + err.message });
        return;
      }

      const file = req.file as S3File;

      if (!file || !file.location) {
        res
          .status(400)
          .json({ message: "File upload failed or missing file location." });
        return;
      }

      const endpoint = process.env.DO_SPACES_ENDPOINT!;
      const cdn = process.env.DO_SPACES_CDN!;
      const url = file.location.replace(endpoint, cdn);

      try {
        const item = await this.galleryService.createGalleryItem(
          createGalleryItemDTO.description,
          url,
          user
        );
        res.status(201).json(item);
      } catch (e) {
        console.error("Failed to create gallery item:", e);
        res.status(500).json({ message: "Failed to create gallery item." });
      }
    });
  }

  @UseGuards(JwtAuthGuard, IrisGuard)
  @Post(":id/like")
  async toggleLike(
    @Resource() galleryItem: GalleryItem,
    @Req() req: RequestWithResource<GalleryItem>
  ): Promise<GalleryItem> {
    const user = req.user as User;
    return this.galleryService.toggleLike(galleryItem.id, user);
  }

  @UseGuards(JwtAuthGuard, IrisGuard)
  @Delete(":id")
  async removeGalleryItem(
    @Resource() galleryItem: GalleryItem,
    @Req() req: RequestWithResource<GalleryItem>
  ): Promise<void> {
    const user = req.user as User;
    return this.galleryService.removeGalleryItem(galleryItem.id, user);
  }
}
