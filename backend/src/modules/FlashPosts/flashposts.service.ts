import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, FindOptionsWhere } from 'typeorm';
import { FlashPost } from './entities/flash-post.entity';
import { CreateFlashPostDTO } from './dto/create-flash-post.dto';
import { UpdateFlashPostDTO } from './dto/update-flash-post.dto';
import { User, Role } from '../Users/entities/user.entity';
import { subHours } from "date-fns";
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/notifications.service';
import { UserService } from '../Users/user.service';

@Injectable()
export class FlashPostsService {
    constructor(
        @InjectRepository(FlashPost)
        private readonly flashRepo: Repository<FlashPost>,

        private readonly notificationsService: NotificationsService,
        private readonly userService: UserService,
    ) {}

    async findAllFlashPosts(page = 1, limit = 5, user: User): Promise<{ data: FlashPost[]; total: number; page: number; lastPage: number; }> {
        const offset = (page - 1) * limit;
        const lessThanADay = subHours(new Date(), 24);

        let whereCondition: FindOptionsWhere<FlashPost>[] | FindOptionsWhere<FlashPost> = { createdAt: MoreThan(lessThanADay) };

        if (user.role !== Role.ADMIN) {
            whereCondition = [
                { createdAt: MoreThan(lessThanADay), irisCode: user.irisCode },
                { createdAt: MoreThan(lessThanADay), irisCode: "all" }
            ];
        }

        const [data, total] = await this.flashRepo.findAndCount({
            where: whereCondition,
            relations: ["author"],
            order: { createdAt: "DESC" },
            skip: offset,
            take: limit,
        });

        const lastPage = Math.ceil(total / limit);
        return { data, total, page, lastPage };
    }

    async findOneFlashPost(id: string): Promise<FlashPost> {
        const flashPost = await this.flashRepo.findOne({
            where: { id },
            relations: ["author"],
        });

        if (!flashPost) {
            throw new NotFoundException("FlashPost not found.");
        }

        return flashPost;
    }

    async createFlashPost(createFlashPostDTO: CreateFlashPostDTO, author: User): Promise<FlashPost> {
        const flashPostActive = await this.flashRepo.count({
            where: {
                author: { id: author.id },
                createdAt: MoreThan(subHours(new Date(), 24)),
            },
        });

        if (flashPostActive > 0) {
            throw new BadRequestException("You already have an active flash post.");
        }

        let irisCode = author.irisCode;
        let irisName = author.irisName;
        if (author.role === Role.ADMIN) {
            irisCode = "all";
            irisName = "all";
        }

        const post = this.flashRepo.create({
            ...createFlashPostDTO,
            author: author,
            irisCode,
            irisName,
        });

        await this.notificationsService.create(
            author.id,
            "Your flash post is now visible to your neighborhood",
            `Your flash post "${post.title}" has been published.`
        );

        if (irisCode !== "all") {
            const neighbors = await this.userService.getUsersByIris(irisCode);
            const others = neighbors.filter(u => u.id !== author.id);

            await this.notificationsService.createMany(
                others.map(u => u.id),
                "New flash post in your neighborhood",
                `${author.firstname} ${author.lastname} posted: "${post.title}"`
            );
        }

        return this.flashRepo.save(post);
    }

    async updateFlashPost(id: string, updateFlashPostDTO: UpdateFlashPostDTO, user: User): Promise<FlashPost> {
        const flashPost = await this.flashRepo.findOne({
            where: { id },
            relations: ["author"],
        });

        if (!flashPost) {
            throw new NotFoundException("FlashPost not found.");
        }

        if (flashPost.author.id !== user.id && user.role !== Role.ADMIN && user.role !== Role.MODERATOR) {
            throw new ForbiddenException("You are not allowed to edit this flash post.");
        }

        const updated = this.flashRepo.merge(flashPost, updateFlashPostDTO);
        
        await this.notificationsService.create(
            user.id,
            "Your flash post was updated",
            `Your flash post "${updated.title}" has been successfully updated.`
        );
        
        return this.flashRepo.save(updated);
    }

    async removeFlashPost(id: string, user: User): Promise<void> {
        const flashPost = await this.flashRepo.findOne({
            where: { id },
            relations: ["author"],
        });

        if (!flashPost) {
            throw new NotFoundException("FlashPost not found.");
        }

        if (flashPost.author.id !== user.id && user.role !== Role.ADMIN && user.role !== Role.MODERATOR) {
            throw new ForbiddenException("You are not allowed to delete this flash post.");
        }

        await this.flashRepo.delete(id);
    }

    async purgeExpired(): Promise<void> {
        const limit = subHours(new Date(), 24);
        await this.flashRepo.delete({ createdAt: LessThan(limit) });
    }

    @Cron(CronExpression.EVERY_HOUR)
    async handleCronPurgeExpired() {
        await this.purgeExpired();
    }

    @Cron(CronExpression.EVERY_HOUR)
    async cleanFlashPostsOfFormersUsers() {
        const flashPosts = await this.flashRepo.find({ relations: ["author"] });
        for (const flashPost of flashPosts) {
            if (!flashPost.author) {
                continue;
            }

            if (flashPost.irisCode === "all") {
                continue;
            }

            if (flashPost.irisCode && flashPost.author.irisCode && flashPost.irisCode !== flashPost.author.irisCode) {
                await this.flashRepo.delete(flashPost.id);
            }
        }
    }
}
