import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from "bcryptjs";
import { UserService } from '../Users/user.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) {}

    async validateUser(email: string, password: string) {
        const user = await this.userService.findByEmail(email);
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = {email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload)
        };
    }
}
