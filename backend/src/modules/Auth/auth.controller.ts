import { Controller, Post, Body, Res, Req, HttpCode, Get, UseGuards } from "@nestjs/common";
import { Response, Request } from "express";
import { AuthService } from "./auth.service";
import { LoginUserDTO } from "./dto/login-user.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @HttpCode(200)
    @Post("login")
    async login(
        @Body() loginUserDTO: LoginUserDTO,
        @Res({ passthrough: true }) res: Response,
    ) {
        console.log("CREDENTIALS +" + JSON.stringify(loginUserDTO));
        const { accessToken, refreshToken, refreshOptions } = await this.authService.login(loginUserDTO);
        res.cookie("refreshToken", refreshToken, refreshOptions);
        return { accessToken };
    }

    @HttpCode(200)
    @Post("refresh")
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const oldToken = req.cookies["refreshToken"];
        const { accessToken } = await this.authService.refresh(oldToken);
        // (Optionnel) : on pourrait ici poser un nouveau refreshToken lors de la rotation

        return { accessToken };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @Post("logout")
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const oldToken = req.cookies["refreshToken"];
        await this.authService.logout(oldToken);
        res.clearCookie("refreshToken", { path: "/" });
        return { message: "Déconnexion réussie." };
    }

    @UseGuards(JwtAuthGuard)
    @Get("me")
    async me(@Req() req: Request) {
        return req.user
    }
}
