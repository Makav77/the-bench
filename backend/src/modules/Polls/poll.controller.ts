import { Controller, Get, Post, Patch, Param, Delete, Query, Body, Redirect, Req, UseGuards, DefaultValuePipe, ParseIntPipe, NotFoundException } from "@nestjs/common";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";
import { Poll } from "./entities/poll.entity";
import { User } from "../Users/entities/user.entity";
import { PollService } from "./poll.service";
import { CreatePollDTO } from "./dto/create-poll.dto";
import { VotePollDTO } from "./dto/vote-poll.dto";
import { Request } from "express";
import { RequiredPermission } from "../Permissions/decorator/require-permission.decorator";
import { PermissionGuard } from "../Permissions/guards/permission.guard";
import { IrisGuard } from "../Auth/guards/iris.guard";
import { RequestWithResource } from "../Auth/guards/iris.guard";

@Controller("polls")
@UseGuards(JwtAuthGuard)
export class PollController {
    constructor(private readonly pollService: PollService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllPolls(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Req() req: RequestWithResource<Poll>
    ): Promise<{ data: Poll[]; total: number; page: number; lastPage: number; }> {
        const user = req.user as User;
        return this.pollService.findAllPolls(page, limit, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Get(":id")
    async findOnePoll(
        @Param("id") id: string,
        @Req() req: RequestWithResource<Poll>
    ): Promise<Poll> {
        const poll = await this.pollService.findOnePoll(id);

        if (!poll) {
            throw new NotFoundException("Poll not found.");
        }

        req.resource = poll;
        return poll;
    }

    @RequiredPermission("create_poll")
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Post()
    async createPoll(
        @Body() createPollDTO: CreatePollDTO,
        @Req() req: RequestWithResource<Poll>
    ): Promise<Poll> {
        const user = req.user as User;
        return this.pollService.createPoll(createPollDTO, user);
    }

    @RequiredPermission("vote_poll")
    @UseGuards(JwtAuthGuard, IrisGuard, PermissionGuard)
    @Post(":id/vote")
    async votePoll(
        @Param("id") id: string,
        @Body() votePollDTO: VotePollDTO,
        @Req() req: RequestWithResource<Poll>
    ): Promise<Poll> {
        const poll = await this.pollService.findOnePoll(id);

        if (!poll) {
            throw new NotFoundException("Poll not found.");
        }

        req.resource = poll;
        const user = req.user as User;
        return this.pollService.vote(id, votePollDTO, user);
    }

    @UseGuards(JwtAuthGuard)
    @Post(":id/close")
    async closePoll(
        @Param("id") id: string,
        @Req() req: RequestWithResource<Poll>
    ): Promise<Poll> {
        const poll = await this.pollService.findOnePoll(id);

        if (!poll) {
            throw new NotFoundException("Poll not found.");
        }

        req.resource = poll;
        const user = req.user as User;
        return this.pollService.closePoll(id, user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async removePoll(
        @Param("id") id: string,
        @Req() req: RequestWithResource<Poll>
    ): Promise<void> {
        const poll = await this.pollService.findOnePoll(id);

        if (!poll) {
            throw new NotFoundException("Poll not found.");
        }

        req.resource = poll;
        const user = req.user as User;
        return this.pollService.removePoll(id, user);
    }
}
