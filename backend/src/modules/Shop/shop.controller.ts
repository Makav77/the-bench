import { Controller, Get, Post, Param, Body, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException } from "@nestjs/common";
import { ShopService } from "./shop.service";
import { CreateBadgeDTO } from "./dto/create-badge.dto";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";
import { RequestWithResource } from "../Utils/request-with-resource.interface";
import { Badge } from "./entities/badge.entity";
import { User } from "../Users/entities/user.entity";
import { diskStorage } from "multer";
import { extname } from "path";
import { FileInterceptor } from "@nestjs/platform-express";

const multerOptions = {
    storage: diskStorage({
        destination: "./uploads/badges",
        filename: (_req, file, callback) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
        },
    }),
    fileFilter: (_req: any, file: { mimetype: string; }, callback: (arg0: Error | null, arg1: boolean) => void) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
            callback(null, true);
        } else {
            callback(new Error("Unsupported file type."), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
};

@Controller("shop")
@UseGuards(JwtAuthGuard)
export class ShopController {
    constructor(private readonly shopService: ShopService) {}

    @UseGuards(JwtAuthGuard)
    @Get("badges")
    async getAllBadgesWithUserInfo(@Req() req: RequestWithResource<Badge>): Promise<Badge[]> {
        const user = req.user as User;
        return this.shopService.getAllBadgesWithUserInfo(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor("image", multerOptions))
    @Post("badges")
    async createBadge(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: CreateBadgeDTO,
        @Req() req: RequestWithResource<Badge>
    ): Promise<Badge> {
        const user = req.user as User;
        if (!file) {
            throw new BadRequestException("Image file required");
        }
        if (user.role !== "admin") {
            throw new BadRequestException("Only admins can create badges");
        }
        const imageUrl = `/upload/badges/${file.filename}`;
        return this.shopService.createBadge(dto, imageUrl);
    }

    @UseGuards(JwtAuthGuard)
    @Get("user-badges")
    async getUserBadges(@Req() req: RequestWithResource<Badge>): Promise<Badge[]> {
        const user = req.user as User;
        return this.shopService.getUserBadges(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post("buy/:badgeId")
    async buyBadge(
        @Param("badgeId") badgeId: string,
        @Req() req: RequestWithResource<Badge>
    ): Promise<{ success: boolean }> {
        const user = req.user as User;
        return this.shopService.buyBadge(user.id, badgeId);
    }
}
