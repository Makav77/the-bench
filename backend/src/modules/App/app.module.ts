import { AuthModule } from './../Auth/auth.module';
import { AuthController } from './../Auth/auth.controller';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from '../../database/database-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../Users/user.module';
import { AuthService } from '../Auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [
        AuthModule,
        TypeOrmModule.forRoot(databaseConfig),
        UserModule,
        AuthModule,
    ],
    controllers: [AuthController, AppController],
    providers: [AppService],
})

export class AppModule { }
