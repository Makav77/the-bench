import { Controller, Get, Param, Query, Post, Body, Patch, Delete, UseGuards, Req, DefaultValuePipe, ParseIntPipe, NotFoundException } from '@nestjs/common';
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
import { IrisGuard } from '../Auth/guards/iris.guard';
import { RequestWithResource } from "../Utils/request-with-resource.interface";
import { Resource } from '../Utils/resource.decorator';

const multerOptions = {
    storage: diskStorage({
        destination: "./uploads/market",
        filename: (_req, file, callback) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
    }),
    fileFilter: (_req: any, file: { mimetype: string; }, callback: (arg0: Error | null, arg1: boolean) => void) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
            callback(null, true);
        } else {
            callback(new Error("Unsupported file type."), false);
        }
    },
    limits: { fileSize: 2 * 1024 * 1024 },
};


@Controller("market")
export class MarketController {
    constructor(private readonly marketService: MarketService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllItems(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Req() req: RequestWithResource<MarketItem>
    ): Promise<{ data: MarketItem[]; total: number; page: number; lastPage: number; }> {
        const user = req.user as User;
        return this.marketService.findAllItems(page, limit, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Get(":id")
    async findOneItem(@Resource() marketItem: MarketItem): Promise<MarketItem> {
        return marketItem;
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(FilesInterceptor("images", 5, multerOptions))
    async createItem(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() createItemDTO: CreateMarketItemDTO,
        @Req() req: RequestWithResource<MarketItem>
    ): Promise<MarketItem> {
        const user = req.user as User;
        const safeFiles = files ?? [];
        const urls = safeFiles.map(file => `/uploads/market/${file.filename}`);
        return this.marketService.createItem({ ...createItemDTO, images: urls }, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Patch(":id")
    @UseInterceptors(FilesInterceptor("images", 5, multerOptions))
    async updateItem(
        @Resource() marketItem: MarketItem,
        @UploadedFiles() files: Express.Multer.File[],
        @Body() updateMarketItemDTO: UpdateMarketItemDTO,
        @Req() req: RequestWithResource<MarketItem>
    ) {
        const user = req.user as User;
        const safeFiles = files ?? [];
        const urls = safeFiles.map(file => `/uploads/market/${file.filename}`);
        const allImages = marketItem.images ? [...marketItem.images, ...urls] : urls;

        return this.marketService.updateItem(marketItem.id, { ...updateMarketItemDTO, images: allImages }, user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async removeItem(
        @Resource() marketItem: MarketItem,
        @Req() req: RequestWithResource<MarketItem>
    ): Promise<void> {
        const user = req.user as User;
        return this.marketService.removeItem(marketItem.id, user);
    }
}
