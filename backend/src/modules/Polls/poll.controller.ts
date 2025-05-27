import { Controller, Get, Post, Patch, Param, Delete, Query, Body, Redirect, Req, UseGuards, DefaultValuePipe, ParseIntPipe } from "@nestjs/common";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";
import { Poll } from "./entities/poll.entity";
import { User } from "../Users/entities/user.entity";
import { PollService } from "./poll.service";
import { CreatePollDTO } from "./dto/create-poll.dto";
import { VotePollDTO } from "./dto/vote-poll.dto";
import { Request } from "express";

@Controller("polls")
@UseGuards(JwtAuthGuard)
export class PollController {
    constructor(private readonly pollService: PollService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllPolls(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(5), ParseIntPipe) limit: number
    ): Promise<{ data: Poll[]; total: number; page: number; lastPage: number; }> {
        return this.pollService.findAllPolls(page, limit);
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id")
    async findOnePoll(@Param("id") id: string): Promise<Poll> {
        return this.pollService.findOnePoll(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createPoll(
        @Body() createPollDTO: CreatePollDTO,
        @Req() req: Request
    ): Promise<Poll> {
        const user = req.user as User;
        return this.pollService.createPoll(createPollDTO, user);
    }

    @UseGuards(JwtAuthGuard)
    @Post(":id/vote")
    async votePoll(
        @Param("id") id: string,
        @Body() votePollDTO: VotePollDTO,
        @Req() req: Request
    ): Promise<Poll> {
        const user = req.user as User;
        return this.pollService.vote(id, votePollDTO, user);
    }

    @UseGuards(JwtAuthGuard)
    @Post(":id/close")
    async closePoll(
        @Param("id") id: string,
        @Req() req: Request
    ): Promise<Poll> {
        const user = req.user as User;
        return this.pollService.closePoll(id, user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async removePoll(
        @Param("id") id: string,
        @Req() req: Request
    ): Promise<void> {
        const user = req.user as User;
        return this.pollService.removePoll(id, user);
    }
}