import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req, DefaultValuePipe, ParseIntPipe, Query, NotFoundException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDTO } from './dto/create-post.dto';
import { UpdatePostDTO } from './dto/update-post.dto';
import { JwtAuthGuard } from '../Auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { Posts } from './entities/post.entity';
import { User } from '../Users/entities/user.entity';
import { RequiredPermission } from '../Permissions/decorator/require-permission.decorator';
import { PermissionGuard } from '../Permissions/guards/permission.guard';
import { IrisGuard } from '../Auth/guards/iris.guard';
import { RequestWithResource } from '../Auth/guards/iris.guard';

@Controller("posts")
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllPosts(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Req() req: RequestWithResource<Posts>
    ): Promise<{ data: Posts[]; total: number; page: number; lastPage: number; }> {
        const user = req.user as User;
        return this.postsService.findAllPosts(page, limit, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Get(":id")
    async findOnePost(
        @Param("id") id: string,
        @Req() req: RequestWithResource<Posts>
    ): Promise<Posts> {
        const post = await this.postsService.findOnePost(id);

        if (!post) {
            throw new NotFoundException("Post not found.");
        }

        req.resource = post;
        return post;
    }

    @RequiredPermission("publish_post")
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Post()
    async createPost(
        @Body() createPostDTO: CreatePostDTO,
        @Req() req: RequestWithResource<Posts>
    ): Promise<Posts> {
        const user = req.user as User;
        return this.postsService.createPost(createPostDTO, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Patch(":id")
    async updatePost(
        @Param("id") id: string,
        @Body() updatePostDTO: UpdatePostDTO,
        @Req() req: RequestWithResource<Posts>
    ): Promise<Posts> {
        const post = await this.postsService.findOnePost(id);

        if (!post) {
            throw new NotFoundException("Post not found.");
        }

        req.resource = post;
        const user = req.user as User;
        return this.postsService.updatePost(id, updatePostDTO, user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async removePost(
        @Param("id") id: string,
        @Req() req: RequestWithResource<Posts>
    ): Promise<void> {
        const post = await this.postsService.findOnePost(id);

        if (!post) {
            throw new NotFoundException("Post not found.");
        }

        req.resource = post;
        const user = req.user as User;
        return this.postsService.removePost(id, user);
    }
}
