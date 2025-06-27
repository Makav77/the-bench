import { Controller, Get, Post, Body, Patch, Param, Query, Delete, UseGuards, Req, DefaultValuePipe, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { FlashPostsService } from './flashposts.service';
import { CreateFlashPostDTO } from './dto/create-flash-post.dto';
import { UpdateFlashPostDTO } from './dto/update-flash-post.dto';
import { JwtAuthGuard } from '../Auth/guards/jwt-auth.guard';
import { FlashPost } from './entities/flash-post.entity';
import { Request } from 'express';
import { User } from '../Users/entities/user.entity';
import { RequiredPermission } from '../Permissions/decorator/require-permission.decorator';
import { PermissionGuard } from '../Permissions/guards/permission.guard';
import { IrisGuard } from '../Auth/guards/iris.guard';
import { RequestWithResource } from '../Auth/guards/iris.guard';
import { Resource } from '../Utils/resource.decorator';

@Controller("flashposts")
export class FlashPostsController {
    constructor(private readonly flashpostsService: FlashPostsService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllFlashPosts(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Req() req: RequestWithResource<FlashPost>
    ): Promise<{ data: FlashPost[]; total: number; page: number; lastPage: number; }> {
        const user = req.user as User;
        return this.flashpostsService.findAllFlashPosts(page, limit, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Get(":id")
    async findOneFlashPost(@Resource() flashPost: FlashPost): Promise<FlashPost> {
        return flashPost;
    }

    @RequiredPermission("publish_flash_post")
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Post()
    async createFlashPost(
        @Body() createFlashPostDTO: CreateFlashPostDTO,
        @Req() req: RequestWithResource<FlashPost>
    ): Promise<FlashPost> {
        const user = req.user as User;
        return this.flashpostsService.createFlashPost(createFlashPostDTO, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Patch(":id")
    async updateFlashPost(
        @Resource() flashPost: FlashPost,
        @Body() updateFlashPostDTO: UpdateFlashPostDTO,
        @Req() req: RequestWithResource<FlashPost>
    ): Promise<FlashPost> {
        const user = req.user as User;
        return this.flashpostsService.updateFlashPost(flashPost.id, updateFlashPostDTO, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Delete(":id")
    async removeFlashPost(
        @Resource() flashPost: FlashPost,
        @Req() req: RequestWithResource<FlashPost>
    ): Promise<void> {
        const user = req.user as User;
        return this.flashpostsService.removeFlashPost(flashPost.id, user);
    }
}
