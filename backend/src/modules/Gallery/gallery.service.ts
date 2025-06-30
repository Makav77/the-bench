import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan, FindOptionsWhere } from "typeorm";
import { GalleryItem } from "./entities/gallery-item.entity";
import { User, Role } from "../Users/entities/user.entity";
import { join } from "path";
import { unlink } from "fs/promises";
import { Cron, CronExpression } from "@nestjs/schedule";
import { toast } from "react-toastify";

@Injectable()
export class GalleryService {
    constructor(
        @InjectRepository(GalleryItem)
        private readonly galleryRepo: Repository<GalleryItem>,
    ) { }

    async findAllGalleryItems(page = 1, limit = 30, user: User): Promise<{ data: GalleryItem[]; total: number; page: number; lastPage: number }> {
        const offset = (page - 1) * limit;

        let whereCondition: FindOptionsWhere<GalleryItem>[] | FindOptionsWhere<GalleryItem> = {};
        if (user.role !== Role.ADMIN) {
            whereCondition = [
                { irisCode: user.irisCode },
                { irisCode: "all" }
            ];
        }

        const [data, total] = await this.galleryRepo.findAndCount({
            where: whereCondition,
            order: { createdAt: "DESC" },
            skip: offset,
            take: limit,
            relations: ["author", "likedBy"],
        });

        const lastPage = Math.ceil(total / limit);
        return { data, total, page, lastPage };
    }

    async findOneGalleryItem(id: string): Promise<GalleryItem> {
        const galleryItem = await this.galleryRepo.findOne({
            where: { id },
            relations: ["author", "likedBy"],
        });

        if (!galleryItem) {
            throw new NotFoundException("Gallery item not found.");
        }
        return galleryItem;
    }

    async createGalleryItem(description: string | undefined, url: string, user: User): Promise<GalleryItem> {
        let irisCode = user.irisCode;
        let irisName = user.irisName;
        if (user.role === Role.ADMIN) {
            irisCode = "all";
            irisName = "all";
        }

        const galleryItem = this.galleryRepo.create({
            url,
            description,
            author: user,
            irisCode,
            irisName,
        });
        return this.galleryRepo.save(galleryItem);
    }

    async toggleLike(id: string, user: User): Promise<GalleryItem> {
        const galleryItem = await this.findOneGalleryItem(id);

        if (!galleryItem) {
            throw new NotFoundException("Gallery item not found.");
        }

        const index = galleryItem.likedBy.findIndex(u => u.id === user.id);
        if (index !== -1) {
            galleryItem.likedBy.splice(index, 1);
        } else {
            galleryItem.likedBy.push(user)
        }
        return this.galleryRepo.save(galleryItem);
    }

    async removeGalleryItem(id: string, user: User): Promise<void> {
        const galleryItem = await this.galleryRepo.findOne({
            where: { id },
            relations: ["author"],
        });

        if (!galleryItem) {
            throw new NotFoundException("Item not found.");
        }

        if (galleryItem.author.id !== user.id && user.role !== Role.ADMIN && user.role !== Role.MODERATOR) {
            throw new ForbiddenException("You are not allowed to delete this item.");
        }

        const filePath = join(process.cwd(), "uploads", "gallery", galleryItem.url.split("/").pop()!);

        try {
            await unlink(filePath);
        } catch (error) {
            toast.error("Could not delete file : " + error);
        }

        await this.galleryRepo.delete(id);
    }

    @Cron(CronExpression.EVERY_HOUR)
    async cleanItemsGalleryOfFormersUsers() {
        const items = await this.galleryRepo.find({ relations: ["author"] });
        for (const item of items) {
            if (!item.author) {
                continue;
            }

            if (item.irisCode && item.author.irisCode && item.irisCode !== item.author.irisCode) {
                await this.galleryRepo.delete(item.id);
            }
        }
    }
}
