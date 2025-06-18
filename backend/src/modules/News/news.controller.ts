import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, DefaultValuePipe, ParseIntPipe } from "@nestjs/common";
import { NewsService } from "./news.service";
import { CreateNewsDTO } from "./dto/create-news.dto"; 
import { UpdateNewsDTO } from "./dto/update-news.dto";
import { News } from "./news.schema";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";

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
