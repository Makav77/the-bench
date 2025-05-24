import { Controller, Get, Post, Patch, Delete, Param, Query, Body, Req, DefaultValuePipe, ParseIntPipe, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";
import { Challenge } from "./entities/challenge.entity";
import { ChallengesService } from "./challenges.service";
import { CreateChallengeDTO } from "./dto/create-challenge.dto";
import { User } from "../Users/entities/user.entity";

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
    @Post()
    async createChallenge(
        @Body() createChallengeDTO: CreateChallengeDTO,
        @Req() req: Request,
    ): Promise<Challenge> {
        const user = req.user as User;
        return this.challengesService.createChallenge(createChallengeDTO, user);
    }
}
