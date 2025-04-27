import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../Users/user.module';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            signOptions: { expiresIn: "1h" },
        }),
        UserModule,
    ],
    controllers: [AuthController],
    providers: [AuthService],
})

export class AuthModule {}
