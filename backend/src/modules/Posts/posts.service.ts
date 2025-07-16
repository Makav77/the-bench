import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Not, Repository } from 'typeorm';
import { Posts } from './entities/post.entity';
import { CreatePostDTO } from './dto/create-post.dto';
import { UpdatePostDTO } from './dto/update-post.dto';
import { User, Role } from '../Users/entities/user.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserService } from '../Users/user.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(Posts)
        private readonly postRepo: Repository<Posts>,

        private readonly notificationsService: NotificationsService,
        private readonly userService: UserService,
    ) {}

    async findAllPosts(page = 1, limit = 10, user: User): Promise<{ data: Posts[]; total: number; page: number; lastPage: number }> {
        const offset = (page - 1) * limit;

        let whereCondition: FindOptionsWhere<Posts>[] | FindOptionsWhere<Posts> = {};
        if (user.role !== Role.ADMIN) {
            whereCondition = [
                { irisCode: user.irisCode },
                { irisCode: "all" }
            ];
        }

        const [data, total] = await this.postRepo.findAndCount({
            where: whereCondition,
            relations: ["author"],
            order: { createdAt: "DESC" },
            skip: offset,
            take: limit,
        });

        const lastPage = Math.ceil(total / limit);
        return { data, total, page, lastPage };
    }

    async findOnePost(id: string): Promise<Posts> {
        const post = await this.postRepo.findOne({
            where: { id },
            relations: ["author"],
        });

        if (!post) {
            throw new NotFoundException("Post not found.");
        }

        return post;
    }

    async createPost(createPostDTO: CreatePostDTO, author: User): Promise<Posts> {
        let irisCode = author.irisCode;
        let irisName = author.irisName;
        if (author.role === Role.ADMIN) {
            irisCode = "all";
            irisName = "all";
        }

        const post = this.postRepo.create({
            ...createPostDTO,
            author,
            irisCode,
            irisName,
        });

        await this.notificationsService.create(
            author.id,
            "Your post is now visible to your neighborhood",
            `Your post "${post.title}" has been published.`
        );

        if (irisCode !== "all") {
            const neighbors = await this.userService.getUsersByIris(irisCode);
            const others = neighbors.filter(u => u.id !== author.id);

            await this.notificationsService.createMany(
                others.map(u => u.id),
                "New post in your neighborhood",
                `${author.firstname} ${author.lastname} posted: "${post.title}"`
            );
        }

        return this.postRepo.save(post);
    }

    async updatePost(id: string, updatePostDTO: UpdatePostDTO, user: User): Promise<Posts> {
        const post = await this.postRepo.findOne({
            where: { id },
            relations: ["author"],
        });

        if (!post) {
            throw new NotFoundException("Post not found");
        }

        if (post.author.id !== user.id && user.role !== Role.ADMIN && user.role !== Role.MODERATOR) {
            throw new ForbiddenException("You are not allowed to edit this post.")
        }

        const updated = this.postRepo.merge(post, updatePostDTO);

        await this.notificationsService.create(
            user.id,
            "Your post was updated",
            `Your post "${updated.title}" has been successfully updated.`
        );

        return this.postRepo.save(updated);
    }

    async removePost(id: string, user: User): Promise<void> {
        const post = await this.postRepo.findOne({
            where: { id },
            relations: ["author"],
        });

        if (!post) {
            throw new ForbiddenException("Post not found");
        }

        if (post.author.id !== user.id && user.role !== Role.ADMIN && user.role !== Role.MODERATOR) {
            throw new ForbiddenException("You are not allowed to delete this post.")
        }  

        await this.postRepo.delete(id);

        await this.notificationsService.create(
            user.id,
            "Your post was removed",
            `Your post "${post.title}" has been deleted.`
        );
    }

    @Cron(CronExpression.EVERY_HOUR)
    async cleanPostsOfFormersUsers() {
        const posts = await this.postRepo.find({ relations: ["author"] });
        for (const post of posts) {
            if (!post.author) {
                continue;
            }

            if (post.irisCode === "all") {
                continue;
            }

            if (post.irisCode && post.author.irisCode && post.irisCode !== post.author.irisCode) {
                await this.postRepo.delete(post.id);
            }
        }
    }
}
