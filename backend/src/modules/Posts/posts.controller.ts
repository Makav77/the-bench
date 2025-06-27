import { Controller, Get, Body, Param, Patch, Delete, UseGuards, Req, DefaultValuePipe, ParseIntPipe, Query, NotFoundException, Post } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDTO } from './dto/create-post.dto';
import { UpdatePostDTO } from './dto/update-post.dto';
import { JwtAuthGuard } from '../Auth/guards/jwt-auth.guard';
import { Posts } from './entities/post.entity';
import { User } from '../Users/entities/user.entity';
import { RequiredPermission } from '../Permissions/decorator/require-permission.decorator';
import { PermissionGuard } from '../Permissions/guards/permission.guard';
import { IrisGuard } from '../Auth/guards/iris.guard';
import { RequestWithResource } from '../Auth/guards/iris.guard';
import { Resource } from 'src/modules/Utils/resource.decorator';

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
    async findOnePost(@Resource() post: Posts) {
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
        @Resource() post: Posts,
        @Body() updatePostDTO: UpdatePostDTO,
        @Req() req: RequestWithResource<Posts>
    ): Promise<Posts> {
        const user = req.user as User;
        return this.postsService.updatePost(post.id, updatePostDTO, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Delete(":id")
    async removePost(
        @Resource() post: Posts,
        @Req() req: RequestWithResource<Posts>
    ): Promise<void> {
        const user = req.user as User;
        return this.postsService.removePost(post.id, user);
    }
}
