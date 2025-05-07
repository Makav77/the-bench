import { MarketService } from './../Market/market.service';
import { PostsModule } from '../Posts/posts.module';
import { PostsController } from '../Posts/posts.controller';
import { AuthModule } from "./../Auth/auth.module";
import { AuthController } from "./../Auth/auth.controller";
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { databaseConfig } from "../../database/database-config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "../Users/user.module";
import { ScheduleModule } from "@nestjs/schedule";
import { EventModule } from "../Events/event.module";
import { EventController } from '../Events/event.controller';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        AuthModule,
        TypeOrmModule.forRoot(databaseConfig),
        UserModule,
        AuthModule,
        EventModule,
        PostsModule,
    ],
    controllers: [
        EventController, PostsController, AuthController, AppController],
    providers: [
        MarketService, AppService],
})

export class AppModule { }
