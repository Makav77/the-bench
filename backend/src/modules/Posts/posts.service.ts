import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Not, Repository } from 'typeorm';
import { Posts } from './entities/post.entity';
import { CreatePostDTO } from './dto/create-post.dto';
import { UpdatePostDTO } from './dto/update-post.dto';
import { User, Role } from '../Users/entities/user.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(Posts)
        private readonly postRepo: Repository<Posts>,
    ) { }

    async findAllPosts(page = 1, limit = 10, user: User): Promise<{ data: Posts[]; total: number; page: number; lastPage: number }> {
        const offset = (page - 1) * limit;

        let whereCondition: FindOptionsWhere<Posts> = {};
        if (user.role !== Role.ADMIN) {
            whereCondition = {
                ...whereCondition,
                irisCode: user.irisCode,
            };
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
        const post = this.postRepo.create({
            ...createPostDTO,
            author,
            irisCode: author.irisCode,
            irisName: author.irisName,
        });
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
    }

    @Cron(CronExpression.EVERY_HOUR)
    async cleanPostsOfFormersUsers() {
        const posts = await this.postRepo.find({ relations: ["author"] });
        for (const post of posts) {
            if (!post.author) {
                continue;
            }

            if (post.irisCode && post.author.irisCode && post.irisCode !== post.author.irisCode) {
                await this.postRepo.delete(post.id);
            }
        }
    }
}
