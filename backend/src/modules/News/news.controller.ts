import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
  Req,
  NotFoundException,
  Res,
} from "@nestjs/common";
import { NewsService } from "./news.service";
import { CreateNewsDTO } from "./dto/create-news.dto";
import { UpdateNewsDTO } from "./dto/update-news.dto";
import { News, NewsDocument } from "./news.schema";
import { User } from "../Users/entities/user.entity";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";
import { UseInterceptors, UploadedFiles } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { ValidateNewsDTO } from "./dto/validate-news.dto";
import { RequiredPermission } from "../Permissions/decorator/require-permission.decorator";
import { PermissionGuard } from "../Permissions/guards/permission.guard";
import { IrisGuard } from "../Auth/guards/iris.guard";
import { RequestWithResource } from "../Utils/request-with-resource.interface";
import { Resource } from "../Utils/resource.decorator";
import { UploadService } from "../Upload/upload.service";
import { Request, Response } from "express";

@Controller("news")
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly uploadService: UploadService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post("upload-images")
  async uploadNewsImages(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<void> {
    const upload = this.uploadService
      .getMulterUploader({ folder: "news" })
      .array("images", 10);

    upload(req as any, res, async (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res
          .status(400)
          .json({ message: "Multer error: " + err.message });
      }

      const files = (req as any).files as (Express.Multer.File & {
        location?: string;
      })[];

      if (!files || !files.length || !files.every((f) => f.location)) {
        return res
          .status(400)
          .json({ message: "File upload failed or missing file location." });
      }

      const endpoint = process.env.DO_SPACES_ENDPOINT!;
      const cdn = process.env.DO_SPACES_CDN!;
      const urls = files.map((f) => f.location!.replace(endpoint, cdn));

      return res.status(200).json({ urls });
    });
  }

  @UseGuards(JwtAuthGuard, IrisGuard)
  @Get(":id")
  async findOneNews(@Resource() news: NewsDocument): Promise<NewsDocument> {
    return news;
  }

  @UseGuards(JwtAuthGuard, IrisGuard)
  @Post(":id/like")
  async toggleLike(
    @Param("id") newsId: string,
    @Req() req: RequestWithResource<News>
  ): Promise<{ liked: boolean; totalLikes: number }> {
    const news = await this.newsService.findOneNews(newsId);

    if (!news) {
      throw new NotFoundException("News not found.");
    }

    req.resource = news;
    const user = req.user as User;
    return this.newsService.toggleLike(newsId, user);
  }

  @UseGuards(JwtAuthGuard, IrisGuard)
  @Get(":id/likes")
  async getLikes(
    @Param("id") newsId: string,
    @Req() req: RequestWithResource<News>
  ): Promise<{ totalLikes: number; liked: boolean }> {
    const news = await this.newsService.findOneNews(newsId);

    if (!news) {
      throw new NotFoundException("News not found.");
    }

    req.resource = news;
    const user = req.user as User;
    return this.newsService.getLikes(newsId, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAllNews(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(5), ParseIntPipe) limit: number,
    @Req() req: RequestWithResource<News>
  ): Promise<{
    data: (News & { totalLikes: number })[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    const user = req.user as User;
    return this.newsService.findAllNews(page, limit, user);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequiredPermission("create_news")
  @Post()
  async createNews(@Req() req: Request, @Res() res: Response): Promise<void> {
    const upload = this.uploadService
      .getMulterUploader({ folder: "news" })
      .array("images", 10);

    upload(req as any, res, async (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res
          .status(400)
          .json({ message: "Multer error: " + err.message });
      }

      const user = (req as any).user as User;
      const files = (req as any).files as (Express.Multer.File & {
        location?: string;
      })[];

      const endpoint = process.env.DO_SPACES_ENDPOINT!;
      const cdn = process.env.DO_SPACES_CDN!;
      const urls = files?.map((f) => f.location!.replace(endpoint, cdn)) ?? [];

      const body = req.body;

      try {
        const news = await this.newsService.createNews(
          {
            ...body,
            images: urls,
          },
          user
        );
        res.status(201).json(news);
      } catch (e) {
        console.error("Create failed:", e);
        res.status(500).json({ message: "Failed to create news." });
      }
    });
  }

  @UseGuards(JwtAuthGuard, IrisGuard)
  @Patch(":id")
  async updateNews(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<void> {
    const upload = this.uploadService
      .getMulterUploader({ folder: "news" })
      .array("images", 10);

    upload(req as any, res, async (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res
          .status(400)
          .json({ message: "Multer error: " + err.message });
      }

      const user = (req as any).user as User;
      const files = (req as any).files as (Express.Multer.File & {
        location?: string;
      })[];

      const endpoint = process.env.DO_SPACES_ENDPOINT!;
      const cdn = process.env.DO_SPACES_CDN!;
      const urls = files?.map((f) => f.location!.replace(endpoint, cdn)) ?? [];

      const updateNewsDTO = {
        ...req.body,
        images: urls,
      };

      try {
        const existing = await this.newsService.findOneNews(id);
        if (!existing) {
          return res.status(404).json({ message: "News not found" });
        }

        const updated = await this.newsService.updateNews(
          id,
          updateNewsDTO,
          user
        );
        res.status(200).json(updated);
      } catch (e) {
        console.error("Update failed:", e);
        res.status(500).json({ message: "Failed to update news." });
      }
    });
  }

  @UseGuards(JwtAuthGuard, IrisGuard)
  @Delete(":id")
  async removeNews(
    @Param("id") id: string,
    @Req() req: RequestWithResource<News>
  ): Promise<void> {
    const news = await this.newsService.findOneNews(id);

    if (!news) {
      throw new NotFoundException("News not found.");
    }

    req.resource = news;
    const user = req.user as User;
    await this.newsService.removeNews(id, user);
  }

  @UseGuards(JwtAuthGuard, IrisGuard)
  @Patch(":id/validate")
  async validateNews(
    @Param("id") id: string,
    @Body() validateNewsDTO: ValidateNewsDTO,
    @Req() req: RequestWithResource<News>
  ) {
    const news = await this.newsService.findOneNews(id);

    if (!news) {
      throw new NotFoundException("News not found.");
    }

    req.resource = news;
    const user = req.user as User;
    return this.newsService.validateNews(id, validateNewsDTO, user);
  }
}
