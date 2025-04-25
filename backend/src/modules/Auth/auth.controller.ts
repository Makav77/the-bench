import { Body, Controller, Post, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginUserDTO } from "./dto/login-user.dto";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("login")
    async login(@Body() loginUserDTO: LoginUserDTO) {
        const user = await this.authService.validateUser(loginUserDTO.email, loginUserDTO.password);
        if (!user) {
            throw new UnauthorizedException("Email or password incorrect");
        }
        return this.authService.login(user);
    }
}
