import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDTO } from './dto/create-post.dto';
import { UpdatePostDTO } from './dto/update-post.dto';
import { User, Role } from '../Users/entities/user.entity';

@Injectable()
export class ListingService {
    constructor(
        @InjectRepository(Post)
        private readonly postRepo: Repository<Post>,
    ) {}

    async findAllPosts(): Promise<Post[]> {
        return this.postRepo.find({ relations: ["author"], order: { createdAt: "ASC"} })
    }

    async findOnePost(id: string): Promise<Post> {
        const post = await this.postRepo.findOne({
            where: { id },
            relations: ["author"],
        });

        if (!post) {
            throw new NotFoundException("Post not found.");
        }
        return post;
    }

    async createPost(createPostDTO: CreatePostDTO, author: User): Promise<Post> {
        const post = this.postRepo.create({
            ...createPostDTO,
            author,
        });
        return this.postRepo.save(post);
    }

    async updatePost(id: string, updatePostDTO: UpdatePostDTO, user: User): Promise<Post> {
        const post = await this.postRepo.findOne({
            where: { id },
            relations: ["author"],
        });

        if (!post) {
            throw new ForbiddenException("Post not found");
        }

        if (post.author.id !== user.id && user.role !== Role.ADMIN) {
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

        if (post.author.id !== user.id && user.role !== Role.ADMIN) {
            throw new ForbiddenException("You are not allowed to delete this post.")
        }

        await this.postRepo.delete(id);
    }
}
