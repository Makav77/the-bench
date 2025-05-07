import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { MarketItem } from './entities/market.entity';
import { CreateMarketItemDTO } from './dto/create-market-item.dto';
import { UpdateMarketItemDTO } from './dto/update-market-item.dto';
import { User, Role } from '../Users/entities/user.entity';

@Injectable()
export class MarketService {
    constructor(
        @InjectRepository(MarketItem)
        private readonly marketRepo: Repository<MarketItem>,
    ) {}

    async findAllItems(page = 1, limit = 10): Promise<{ data: MarketItem[]; total: number; page: number; lastPage: number; }> {
        const offset = (page - 1) * limit;
        const [data, total] = await this.marketRepo.findAndCount({
            order: { createdAt: "ASC" },
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

    async createItem(createItemDTO: CreateMarketItemDTO, user: User): Promise<MarketItem> {
        const item = this.marketRepo.create({
            ...createItemDTO,
            author: user
        });
        return this.marketRepo.save(item);
    }

    async updateItem(id: string, updateItemDTO: UpdateMarketItemDTO, user: User): Promise<MarketItem> {
        const item = await this.marketRepo.findOne({
            where: { id },
            relations: ["author"],
        });

        if (!item) {
            throw new NotFoundException("Item not found.");
        }

        if (item.author.id !== user.id && user.role !== Role.ADMIN) {
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

        if (item.author.id !== user.id && user.role !== Role.ADMIN) {
            throw new ForbiddenException("You are not allowed to delete this item.");
        }

        await this.marketRepo.delete(id);
    }
}
