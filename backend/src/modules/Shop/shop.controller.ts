import { Controller, Get, Post, Param, Body, UseGuards, Req } from "@nestjs/common";
import { ShopService } from "./shop.service";
import { CreateBadgeDTO } from "./dto/create-badge.dto";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";
import { RequestWithResource } from "../Utils/request-with-resource.interface";
import { Badge } from "./entities/badge.entity";
import { User } from "../Users/entities/user.entity";

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
    @Post("badges")
    async createBadge(@Body() dto: CreateBadgeDTO): Promise<Badge> {
        return this.shopService.createBadge(dto);
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
