import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindOptionsWhere } from 'typeorm';
import { MarketItem } from './entities/market.entity';
import { CreateMarketItemDTO } from './dto/create-market-item.dto';
import { UpdateMarketItemDTO } from './dto/update-market-item.dto';
import { User, Role } from '../Users/entities/user.entity';
import { GalleryItem } from '../Gallery/entities/gallery-item.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class MarketService {
    constructor(
        @InjectRepository(MarketItem)
        private readonly marketRepo: Repository<MarketItem>,
    ) {}

    async findAllItems(page = 1, limit = 10, user: User): Promise<{ data: MarketItem[]; total: number; page: number; lastPage: number; }> {
        const offset = (page - 1) * limit;

        let whereCondition: FindOptionsWhere<MarketItem>[] | FindOptionsWhere<MarketItem> = {};
        if (user.role !== Role.ADMIN) {
            whereCondition = [
                { irisCode: user.irisCode },
                { irisCode: "all" }
            ];
        }

        const [data, total] = await this.marketRepo.findAndCount({
            where: whereCondition,
            order: { createdAt: "DESC" },
            skip: offset,
            take: limit,
            relations: ["author"],
        });

        const lastPage = Math.ceil(total / limit);
        return { data, total, page, lastPage };
    }

    async findOneItem(id: string): Promise<MarketItem> {
        const item = await this.marketRepo.findOne({
            where: { id },
            relations: ["author"],
        });

        if (!item) {
            throw new NotFoundException("Item not found.");
        }

        return item;
    }

    async createItem(createItemDTO: CreateMarketItemDTO, user: User & { images?: string[] }): Promise<MarketItem> {
        let irisCode = user.irisCode;
        let irisName = user.irisName;
        if (user.role === Role.ADMIN) {
            irisCode = "all";
            irisName = "all";
        }
        
        const item = this.marketRepo.create({
            ...createItemDTO,
            author: user,
            irisCode,
            irisName,
        });

        return this.marketRepo.save(item);
    }

    async updateItem(id: string, updateItemDTO: UpdateMarketItemDTO, user: User & { images?: string[] }): Promise<MarketItem> {
        const item = await this.marketRepo.findOne({
            where: { id },
            relations: ["author"],
        });

        if (!item) {
            throw new NotFoundException("Item not found.");
        }

        if (item.author.id !== user.id && user.role !== Role.ADMIN && user.role !== Role.MODERATOR) {
            throw new ForbiddenException("You are not allowed to edit this item.");
        }

        const updated = this.marketRepo.merge(item, updateItemDTO);
        return this.marketRepo.save(updated);
    }

    async removeItem(id: string, user: User): Promise<void> {
        const item = await this.marketRepo.findOne({
            where: { id },
            relations: ["author"],
        });

        if (!item) {
            throw new NotFoundException("Item not found.");
        }

        if (item.author.id !== user.id && user.role !== Role.ADMIN && user.role !== Role.MODERATOR) {
            throw new ForbiddenException("You are not allowed to delete this item.");
        }

        await this.marketRepo.delete(id);
    }

    @Cron(CronExpression.EVERY_HOUR)
    async cleanItemsMarketOfFormersUsers() {
        const items = await this.marketRepo.find({ relations: ["author"] });
        for (const item of items) {
            if (!item.author) {
                continue;
            }

            if (item.irisCode && item.author.irisCode && item.irisCode !== item.author.irisCode) {
                await this.marketRepo.delete(item.id);
            }
        }
    }
}
