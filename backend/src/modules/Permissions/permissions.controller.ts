import { Controller, Post, Get, Delete, Param, Query, Req, UseGuards, BadRequestException, UseGuards } from "@nestjs/common";
import { PermissionsService } from "./permissions.service";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";
import { Request } from "express";

@Controller("permissions")
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) {}

    @UseGuards(JwtAuthGuard)
    @Post(":code/restrict")
    async restrictUser(
        @Param("code") code: string,
        @Query("expiresAt") expiresAt: string,
        @Req() req: Request,
    ) {
        if (!expiresAt) {
            throw new BadRequestException("expiresAt query parameter is required.");
        }
        const user = req.user as any;
        const date = new Date(expiresAt);
        return this.permissionsService.restrictUser(user, code, date);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":code/restrict")
    async removeRestriction(
        @Param("code") code: string,
        @Req() req: Request,
    ) {
        const user = req.user as any;
        await this.permissionsService.removeRestriction(user, code);
    }

    @UseGuards(JwtAuthGuard)
    @Get(":code/isRestricted")
    async isRestricted(
        @Param("code") code: string,
        @Req() req: Request,
    ) {
        const user = req.user as any;
        const restricted = await this.permissionsService.isRestricted(user, code);
        return { code, restricted };
    }
}
