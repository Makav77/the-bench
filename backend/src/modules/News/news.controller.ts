import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, DefaultValuePipe, ParseIntPipe } from "@nestjs/common";
import { NewsService } from "./news.service";
import { CreateNewsDTO } from "./dto/create-news.dto"; 
import { UpdateNewsDTO } from "./dto/update-news.dto";
import { News } from "./news.schema";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";
import { UseInterceptors, UploadedFiles } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { v4 as uuidv4 } from "uuid"
import fs from "fs";

@Controller("news")
export class NewsController {
    constructor(private readonly newsService: NewsService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllNews(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(5), ParseIntPipe)limit: number
    ): Promise<{ data: News[]; total: number; page: number; lastPage: number; }> {
        return this.newsService.findAllNews(Number(page), Number(limit));
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id")
    async findOneNews(@Param("id") id: string): Promise<News> {
        return this.newsService.findOneNews(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createNews(@Body() createNewsDTO: CreateNewsDTO): Promise<News> {
        return this.newsService.createNews(createNewsDTO);
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

    @UseGuards(JwtAuthGuard)
    @Patch(":id")
    async updateNews(
        @Param("id") id: string,
        @Body() updateNewsDTO: UpdateNewsDTO
    ): Promise<News> {
        return this.newsService.updateNews(id, updateNewsDTO);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async removeNews(@Param("id") id: string): Promise<void> {
        await this.newsService.removeNews(id);
    }
}
