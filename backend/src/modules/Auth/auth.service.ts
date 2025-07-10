import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { UserService } from "../Users/user.service";
import { LoginUserDTO } from "./dto/login-user.dto";
import { CookieOptions } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { RefreshToken } from "./entities/refresh-token.entity";
import { Repository } from "typeorm";

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepo: Repository<RefreshToken>,
    ) {}

    async login(loginUserDTO: LoginUserDTO): Promise<{ accessToken: string; refreshToken: string; refreshOptions: CookieOptions;}> {
        const { email, password, rememberMe } = loginUserDTO;
        const user = await this.userService.findByEmail(email);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException("Incorrect password");
        }

        const payload = { sub: user.id, email: user.email, role: user.role };

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: "15m",
        });

        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: rememberMe ? "30d" : "1d",
        });

        const expiresAt = new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000);

        const rtEntity = this.refreshTokenRepo.create({
            token: refreshToken,
            expiresAt,
            revoked: false,
            user,
        });
        await this.refreshTokenRepo.save(rtEntity);

        const refreshOptions: CookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: rememberMe ? 30*24*60*60*1000 : 24*60*60*1000,
        };

        return { accessToken, refreshToken, refreshOptions };
    }

    async refresh(oldToken: string): Promise<{ accessToken: string }> {
        const stored = await this.refreshTokenRepo.findOne({
            where: {
                token: oldToken
            },
            relations: ["user"],
        });

        if (!stored || stored.revoked) {
            throw new UnauthorizedException("Refresh token invalid or revoked.");
        }

        if (stored.expiresAt < new Date()) {
            throw new UnauthorizedException("Invalid refresh token.");
        }

        let payload: any;
        try {
            payload = this.jwtService.verify(oldToken);
        } catch {
            throw new UnauthorizedException("Invalid refresh token.");
        }

        const newAccessToken = this.jwtService.sign(
            { sub: payload.sub, email: payload.email, role: payload.role },
            { expiresIn: "15m" },
        );

        return { accessToken: newAccessToken };
    }

    async logout(oldToken: string): Promise<void> {
        const stored = await this.refreshTokenRepo.findOne({
            where: {
                token: oldToken
            }
        });

        if (stored) {
            stored.revoked = true;
            await this.refreshTokenRepo.save(stored);
        }
    }
}
