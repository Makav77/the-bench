import { Controller, Get, Post, Patch, Delete, Param, Query, Body, Req, DefaultValuePipe, ParseIntPipe, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";
import { Challenge } from "./entities/challenge.entity";
import { ChallengesService } from "./challenges.service";
import { CreateChallengeDTO } from "./dto/create-challenge.dto";
import { User } from "../Users/entities/user.entity";
import { SubmitCompletionDTO } from "./dto/submit-completion.dto";
import { ChallengeCompletion } from "./entities/challenge-completion.entity";
import { ValidateCompletionDTO } from "./dto/validate-completion.dto";
import { RequiredPermission } from "../Permissions/decorator/require-permission.decorator";

@Controller("challenges")
export class ChallengesController {
    constructor(private readonly challengesService: ChallengesService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllChallenges(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number
    ): Promise<{ data: Challenge[]; total: number; page: number; lastPage: number; }> {
        return this.challengesService.findAllChallenges(page, limit);
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id")
    async findOneChallenge(@Param("id") id: string): Promise<Challenge> {
        return this.challengesService.findOneChallenge(id);
    }

    @UseGuards(JwtAuthGuard)
    @RequiredPermission("create_challenge")
    @Post()
    async createChallenge(
        @Body() createChallengeDTO: CreateChallengeDTO,
        @Req() req: Request,
    ): Promise<Challenge> {
        const user = req.user as User;
        return this.challengesService.createChallenge(createChallengeDTO, user);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(":id")
    async updateChallenge(
        @Param("id") id: string,
        @Body() createChallengeDTO: CreateChallengeDTO,
        @Req() req: Request,
    ): Promise<Challenge> {
        const user = req.user as User;
        return this.challengesService.updateChallenge(id, createChallengeDTO, user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async removeChallenge(
        @Param("id") id: string,
        @Req() req: Request,
    ): Promise<void> {
        const user = req.user as User;
        return this.challengesService.removeChallenge(id, user);
    }

    @UseGuards(JwtAuthGuard)
    @RequiredPermission("register_challenge")
    @Post(":id/subscribe")
    async subscribe(
        @Param("id") id: string,
        @Req() req: Request,
    ): Promise<Challenge> {
        const user = req.user as User;
        return this.challengesService.subscribe(id, user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id/subscribe")
    async unsubscribe(
        @Param("id") id: string,
        @Req() req: Request,
    ): Promise<Challenge> {
        const user = req.user as User;
        return this.challengesService.unsubscribe(id, user);
    }

    @UseGuards(JwtAuthGuard)
    @Post(":id/complete")
    async submitCompletion(
        @Param("id") id: string,
        @Body() submitCompletionDTO: SubmitCompletionDTO,
        @Req() req: Request,
    ): Promise<ChallengeCompletion> {
        const user = req.user as User;
        return this.challengesService.submitCompletion(id, submitCompletionDTO, user);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(":id/complete/:completionId")
    async validateCompletion(
        @Param("id") id: string,
        @Param("completionId") completionId: string,
        @Body() validateCompletionDTO: ValidateCompletionDTO,
        @Req() req: Request,
    ): Promise<ChallengeCompletion> {
        const user = req.user as User;
        return this.challengesService.validateCompletion(id, completionId, validateCompletionDTO, user);
    }
}
