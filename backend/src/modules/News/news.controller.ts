import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, DefaultValuePipe, ParseIntPipe, Req, NotFoundException } from "@nestjs/common";
import { NewsService } from "./news.service";
import { CreateNewsDTO } from "./dto/create-news.dto"; 
import { UpdateNewsDTO } from "./dto/update-news.dto";
import { News } from "./news.schema";
import { User } from "../Users/entities/user.entity";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";
import { UseInterceptors, UploadedFiles } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { v4 as uuidv4 } from "uuid"
import fs from "fs";
import { ValidateNewsDTO } from "./dto/validate-news.dto";
import { RequiredPermission } from "../Permissions/decorator/require-permission.decorator";
import { PermissionGuard } from "../Permissions/guards/permission.guard";
import { IrisGuard } from "../Auth/guards/iris.guard";
import { RequestWithResource } from "../Auth/guards/iris.guard";

@Controller("news")
export class NewsController {
    constructor(private readonly newsService: NewsService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllNews(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Req() req: RequestWithResource<News>
    ): Promise<{ data: (News & { totalLikes: number })[]; total: number; page: number; lastPage: number; }> {
        const user = req.user as User;
        return this.newsService.findAllNews(page, limit, user);
    }

    @UseGuards(JwtAuthGuard)
    @Get("pending")
    async findPendingNews(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Req() req: RequestWithResource<News>
    ) {
        const user = req.user as User;
        return this.newsService.findPendingNews(page, limit, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Get(":id")
    async findOneNews(
        @Param("id") id: string,
        @Req() req: RequestWithResource<News>
    ): Promise<News> {
        const news = await this.newsService.findOneNews(id);

        if (!news) {
            throw new NotFoundException("News not found.");
        }

        req.resource = news;
        return news;
    }

    @UseGuards(JwtAuthGuard, PermissionGuard)
    @RequiredPermission("create_news")
    @Post()
    async createNews(
        @Body() createNewsDTO: CreateNewsDTO,
        @Req() req: RequestWithResource<News>
    ) {
        const user = req.user as User;
        return this.newsService.createNews(createNewsDTO, user);
    }

    @UseGuards(JwtAuthGuard)
    @Post("upload-images")
    @UseInterceptors(FilesInterceptor("images", 10, {
        storage: diskStorage({
            destination: (_req, _file, cb) => {
                const uploadPath = "./uploads/news";
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (_req, file, cb) => {
                const uniqueSuffix = uuidv4();
                const ext = extname(file.originalname);
                cb(null, `${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: (_req, file, cb) => {
            if (!file.mimetype.startsWith("image/")) {
                return cb(new Error("Only images are allowed"), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5*1024*1024 }
    }))
    async uploadImages(@UploadedFiles() files: Express.Multer.File[]): Promise<{ urls: string[] }> {
        const urls = files.map(file => `/uploads/news/${file.filename}`);
        return { urls };
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Patch(":id")
    async updateNews(
        @Param("id") id: string,
        @Body() updateNewsDTO: UpdateNewsDTO,
        @Req() req: RequestWithResource<News>
    ): Promise<News> {
        const news = await this.newsService.findOneNews(id);

        if (!news) {
            throw new NotFoundException("News not found.");
        }

        req.resource = news;
        const user = req.user as User;
        return this.newsService.updateNews(id, updateNewsDTO, user);
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
}
