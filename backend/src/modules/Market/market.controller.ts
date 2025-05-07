import { Controller, Get, Param, Query, Post, Body, Patch, Delete, UseGuards, Req, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
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
    async createItem(
        @Body() createItemDTO: CreateMarketItemDTO,
        @Req() req: Request,
    ): Promise<MarketItem> {
        const user = req.user as User;
        return this.marketService.createItem(createItemDTO, user);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(":id")
    async updateItem(
        @Param("id") id: string,
        @Body() updateItemDTO: UpdateMarketItemDTO,
        @Req() req: Request,
    ): Promise<MarketItem> {
        const user = req.user as User;
        return this.marketService.updateItem(id, updateItemDTO, user);
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
