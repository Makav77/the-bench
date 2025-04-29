import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy, StrategyOptionsWithoutRequest } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { UserService } from "../../../modules/Users/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) {
        const secret = configService.get<string>("JWT_SECRET");
        if (!secret) {
            throw new Error("JWT_SECRET must be defined in environment variables.")
        }

        const options: StrategyOptionsWithoutRequest = {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        };
        super(options);
    }

    async validate(payload: any) {
        const user = await this.userService.findOne(payload.sub);
        if (!user) {
            throw new UnauthorizedException("Utilisateur introuvable.");
        }
        return user;
    }
}
