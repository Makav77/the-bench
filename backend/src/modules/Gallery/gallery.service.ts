import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan } from "typeorm";
import { GalleryItem } from "./entities/gallery-item.entity";
import { CreateGalleryItemDTO } from "./dto/create-gallery-item.dto";
import { User, Role } from "../Users/entities/user.entity";

@Injectable()
export class GalleryService {
    constructor(
        @InjectRepository(GalleryItem)
        private readonly galleryRepo: Repository<GalleryItem>,
    ) {}

    async findAllGalleryItems(page = 1, limit = 30): Promise<{ data: GalleryItem[]; total: number; page: number; lastPage: number }> {
        const offset = (page - 1) * limit;
        const [data, total] = await this.galleryRepo.findAndCount({
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

    async createGalleryItem(createGalleryItemDTO: CreateGalleryItemDTO, url: string, user: User): Promise<GalleryItem> {
        const galleryItem = await this.galleryRepo.create({
            ...createGalleryItemDTO,
            url,
            author: user
        });
        return this.galleryRepo.save(galleryItem);
    }

    async likeGalleryItem(id: string, user: User): Promise<GalleryItem> {
        const galleryItem = await this.galleryRepo.findOne({ where: { id } });

        if (!galleryItem) {
            throw new NotFoundException("Gallery item not found.");
        }
        const alreadyLiked = galleryItem.likedBy.find(u => u.id === user.id);

        galleryItem.likedBy = alreadyLiked
            ? galleryItem.likedBy.filter(u => u.id !== user.id)
            : [...galleryItem.likedBy, user];

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

        if (galleryItem.author.id !== user.id && user.role !== Role.ADMIN) {
            throw new ForbiddenException("You are not allowed to delete this item.");
        }

        await this.galleryRepo.delete(id);
    }
}
