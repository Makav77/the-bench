import { Controller, Get, Post, Patch, Delete, Param, Query, Body, Req, DefaultValuePipe, ParseIntPipe, UseGuards, NotFoundException, UseInterceptors, UploadedFile, BadRequestException } from "@nestjs/common";
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
import { diskStorage } from "multer";
import { extname } from "path";
import { FileInterceptor } from "@nestjs/platform-express";

const multerOptions = {
    storage: diskStorage({
        destination: "./uploads/challenge_completions",
        filename: (_req, file, callback) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
    }),
    fileFilter: (_req: any, file: { mimetype: string; }, callback: (arg0: Error | null, arg1: boolean) => void) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
            callback(null, true);
        } else {
            callback(new Error("Unsupported file type."), false);
        }
    },
    limits: { fileSize: 3 * 1024 * 1024 },
};

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
    @UseInterceptors(FileInterceptor("file", multerOptions))
    async submitCompletion(
        @Resource() challenge: Challenge,
        @UploadedFile() file: Express.Multer.File,
        @Body() submitCompletionDTO: SubmitCompletionDTO,
        @Req() req: RequestWithResource<Challenge>
    ): Promise<ChallengeCompletion> {
        const user = req.user as User;

        let imageUrl = submitCompletionDTO.imageUrl;
        if (file) {
            imageUrl = `/uploads/challenge_completions/${file.filename}`;
        }

        if (
            (!submitCompletionDTO.text || submitCompletionDTO.text.trim() === "") &&
            (!imageUrl || imageUrl.trim() === "")
        ) {
            throw new BadRequestException("Merci de fournir une preuve texte ou image 😊");
        }

        return this.challengesService.submitCompletion(
            challenge.id,
            { ...submitCompletionDTO, imageUrl },
            user
        );
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
