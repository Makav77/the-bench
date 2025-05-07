import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req, DefaultValuePipe, ParseIntPipe, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDTO } from './dto/create-post.dto';
import { UpdatePostDTO } from './dto/update-post.dto';
import { JwtAuthGuard } from '../Auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { Posts } from './entities/post.entity';
import { User } from '../Users/entities/user.entity';

@Controller("posts")
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllPosts(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number
    ): Promise<{ data: Posts[]; total: number; page: number; lastPage: number; }> {
        return this.postsService.findAllPosts();
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id")
    async findOnePost(@Param("id") id: string): Promise<Posts> {
        return this.postsService.findOnePost(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createPost(
        @Body() createPostDTO: CreatePostDTO,
        @Req() req: Request,
    ): Promise<Posts> {
        const user = req.user as User;
        return this.postsService.createPost(createPostDTO, user);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(":id")
    async updatePost(
        @Param("id") id: string,
        @Body() updatePostDTO: UpdatePostDTO,
        @Req() req: Request,
    ): Promise<Posts> {
        const user = req.user as User;
        return this.postsService.updatePost(id, updatePostDTO, user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async removePost(
        @Param("id") id: string,
        @Req() req: Request,
    ): Promise<void> {
        const user = req.user as User;
        return this.postsService.removePost(id, user);
    }
}
