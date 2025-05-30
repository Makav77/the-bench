import { Controller, Post, Get, Delete, Param, Body, Req, BadRequestException, UseGuards } from "@nestjs/common";
import { PermissionsService } from "./permissions.service";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";
import { RestrictUserDTO } from "./dto/restrict-user.dto";
import { Request } from "express";
import { User } from "../Users/entities/user.entity";

@Controller("permissions")
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) {}

    @UseGuards(JwtAuthGuard)
    @Post(":code/restrict")
    async restrictUser(
        @Param("code") code: string,
        @Body() restrictUserDTO: RestrictUserDTO,
        @Req() req: Request,
    ) {
        const { userId, reason, days = 0, hours = 0, minutes = 0 } = restrictUserDTO;

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
        expiresAt.setHours(expiresAt.getHours() + hours);
        expiresAt.setMinutes(expiresAt.getMinutes() + minutes);

        if (expiresAt <= new Date()) {
            throw new BadRequestException("Duration must be positive.");
        }

        const user = req.user as User;

        return this.permissionsService.restrictUser(user, code, userId, reason, expiresAt);
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
