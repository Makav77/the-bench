import { Controller, Get, Post, Patch, Delete, Param, Query, Body, Req, DefaultValuePipe, ParseIntPipe, UseGuards, NotFoundException } from "@nestjs/common";
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
import { PermissionGuard } from "../Permissions/guards/permission.guard";
import { ValidateChallengeDTO } from "./dto/validate-challenge.dto";
import { IrisGuard } from "../Auth/guards/iris.guard";
import { RequestWithResource } from "../Utils/request-with-resource.interface";
import { Resource } from "../Utils/resource.decorator";

@Controller("challenges")
export class ChallengesController {
    constructor(private readonly challengesService: ChallengesService) { }

    @UseGuards(JwtAuthGuard)
    @Get("pending")
    async findPendingChallenges(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Req() req: RequestWithResource<Challenge>
    ): Promise<{ data: Challenge[]; total: number; page: number; lastPage: number }> {
        const user = req.user as User;
        return this.challengesService.findPendingChallenges(page, limit, user);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllChallenges(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Req() req: RequestWithResource<Challenge>
    ): Promise<{ data: Challenge[]; total: number; page: number; lastPage: number; }> {
        const user = req.user as User;
        return this.challengesService.findAllChallenges(page, limit, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Get(":id")
    async findOneChallenge(@Resource() challenge: Challenge): Promise<Challenge> {
        return challenge;
    }

    @UseGuards(JwtAuthGuard)
    @Get("completions/pending")
    async findPendingCompletions(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Req() req: RequestWithResource<Challenge>
    ): Promise<{ data: ChallengeCompletion[]; total: number; page: number; lastPage: number }> {
        const user = req.user as User;
        return this.challengesService.findPendingCompletions(page, limit, user);
    }

    @RequiredPermission("create_challenge")
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Post()
    async createChallenge(
        @Body() createChallengeDTO: CreateChallengeDTO,
        @Req() req: RequestWithResource<Challenge>
    ): Promise<Challenge> {
        const user = req.user as User;
        return this.challengesService.createChallenge(createChallengeDTO, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Patch(":id")
    async updateChallenge(
        @Resource() challenge: Challenge,
        @Body() createChallengeDTO: CreateChallengeDTO,
        @Req() req: RequestWithResource<Challenge>
    ): Promise<Challenge> {
        const user = req.user as User;
        return this.challengesService.updateChallenge(challenge.id, createChallengeDTO, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Patch(":id/validate")
    async validateChallenge(
        @Resource() challenge: Challenge,
        @Body() validateChallengeDTO: ValidateChallengeDTO,
        @Req() req: RequestWithResource<Challenge>
    ): Promise<Challenge> {
        const user = req.user as User;
        return this.challengesService.validateChallenge(challenge.id, validateChallengeDTO, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Delete(":id")
    async removeChallenge(
        @Resource() challenge: Challenge,
        @Req() req: RequestWithResource<Challenge>
    ): Promise<void> {
        const user = req.user as User;
        return this.challengesService.removeChallenge(challenge.id, user);
    }

    @RequiredPermission("register_challenge")
    @UseGuards(JwtAuthGuard, IrisGuard, PermissionGuard)
    @Post(":id/subscribe")
    async subscribe(
        @Resource() challenge: Challenge,
        @Req() req: RequestWithResource<Challenge>
    ): Promise<Challenge> {
        const user = req.user as User;
        return this.challengesService.subscribe(challenge.id, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Delete(":id/subscribe")
    async unsubscribe(
        @Resource() challenge: Challenge,
        @Req() req: RequestWithResource<Challenge>
    ): Promise<Challenge> {
        const user = req.user as User;
        return this.challengesService.unsubscribe(challenge.id, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Post(":id/complete")
    async submitCompletion(
        @Resource() challenge: Challenge,
        @Body() submitCompletionDTO: SubmitCompletionDTO,
        @Req() req: RequestWithResource<Challenge>
    ): Promise<ChallengeCompletion> {
        const user = req.user as User;
        return this.challengesService.submitCompletion(challenge.id, submitCompletionDTO, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Patch(":id/complete/:completionId")
    async validateCompletion(
        @Resource() challenge: Challenge,
        @Param("completionId") completionId: string,
        @Body() validateCompletionDTO: ValidateCompletionDTO,
        @Req() req: RequestWithResource<Challenge>
    ): Promise<ChallengeCompletion> {
        const user = req.user as User;
        return this.challengesService.validateCompletion(challenge.id, completionId, validateCompletionDTO, user);
    }
}
