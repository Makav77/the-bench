import { Controller, Get, Post, Body, Patch, Param, Query, Delete, UseGuards, Req, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { FlashPostsService } from './flashposts.service';
import { CreateFlashPostDTO } from './dto/create-flash-post.dto';
import { UpdateFlashPostDTO } from './dto/update-flash-post.dto';
import { JwtAuthGuard } from '../Auth/guards/jwt-auth.guard';
import { FlashPost } from './entities/flash-post.entity';
import { Request } from 'express';
import { User } from '../Users/entities/user.entity';

@Controller("flashposts")
export class FlashPostsController {
    constructor(private readonly flashpostsService: FlashPostsService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllFlashPosts(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(5), ParseIntPipe) limit: number
    ): Promise<{ data: FlashPost[]; total: number; page: number; lastPage: number; }> {
        return this.flashpostsService.findAllFlashPosts(page, limit);
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id")
    async findOneFlashPost(@Param("id") id: string): Promise<FlashPost> {
        return this.flashpostsService.findOneFlashPost(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createFlashPost(
        @Body() createFlashPostDTO: CreateFlashPostDTO,
        @Req() req: Request,
    ): Promise<FlashPost> {
        const user = req.user as User;
        return this.flashpostsService.createFlashPost(createFlashPostDTO, user);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(":id")
    async updateFlashPost(
        @Param("id") id: string,
        @Body() updateFlashPostDTO: UpdateFlashPostDTO,
        @Req() req: Request,
    ): Promise<FlashPost> {
        const user = req.user as User;
        return this.flashpostsService.updateFlashPost(id, updateFlashPostDTO, user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async removeFlashPost(
        @Param("id") id: string,
        @Req() req: Request,
    ): Promise<void> {
        const user = req.user as User;
        return this.flashpostsService.removeFlashPost(id, user);
    }
}
