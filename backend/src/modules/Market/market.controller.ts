import { Controller, Get, Param, Query, Post, Body, Patch, Delete, UseGuards, Req, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from "multer";
import { extname } from 'path';
import { MarketService } from './market.service';
import { CreateMarketItemDTO } from './dto/create-market-item.dto';
import { UpdateMarketItemDTO } from './dto/update-market-item.dto';
import { JwtAuthGuard } from '../Auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { MarketItem } from './entities/market.entity';
import { User } from '../Users/entities/user.entity';

@Controller("market")
export class MarketController {
    constructor(private readonly marketService: MarketService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllItems(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number
    ): Promise<{ data: MarketItem[]; total: number; page: number; lastPage: number; }> {
        return this.marketService.findAllItems(page, limit);
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id")
    async findOneItem(@Param("id") id: string): Promise<MarketItem> {
        return this.marketService.findOneItem(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(
        FilesInterceptor("images", 5, {
            storage: diskStorage({
                destination: "./uploads/market",
                filename: (_req, file, callback) => {
                    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (_req, file, callback) => {
                if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                    callback(null, true);
                } else {
                    callback(new Error("Unsupported file type."), false);
                }
            },
            limits: { fileSize: 2 * 1024 * 1024 },
        }),
    )
    async createItem(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() createItemDTO: CreateMarketItemDTO,
        @Req() req: Request,
    ): Promise<MarketItem> {
        const user = req.user as User;
        const safeFiles = files ?? [];
        const urls = safeFiles.map(file => `/uploads/market/${file.filename}`);
        return this.marketService.createItem({ ...createItemDTO, images: urls }, user);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(":id")
    @UseInterceptors(
        FilesInterceptor("images", 5, {
            storage: diskStorage({
                destination: "./uploads/market",
                filename: (_req, file, callback) => {
                    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (_req, file, callback) => {
                if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                    callback(null, true);
                } else {
                    callback(new Error("Unsupported file type."), false);
                }
            },
            limits: { fileSize: 2 * 1024 * 1024 },
        }),
    )
    async updateItem(
        @Param("id") id: string,
        @UploadedFiles() files: Express.Multer.File[],
        @Body() updateMarketItemDTO: UpdateMarketItemDTO,
        @Req() req: Request,
    ) {
        const user = req.user as User;
        const safeFiles = files ?? [];
        const urls = safeFiles.map(file => `/uploads/market/${file.filename}`);
        const existing = await this.marketService.findOneItem(id);
        const allImages = existing.images ? [...existing.images, ...urls] : urls;

        return this.marketService.updateItem(id, { ...updateMarketItemDTO, images: allImages }, user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async removeItem (
        @Param("id") id: string,
        @Req() req: Request,
    ): Promise<void> {
        const user = req.user as User;
        return this.marketService.removeItem(id, user);
    }
}
