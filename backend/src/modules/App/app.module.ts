import { MarketModule } from './../Market/market.module';
import { MarketController } from './../Market/market.controller';
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
import { MulterModule } from '@nestjs/platform-express';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TypeOrmModule.forRoot(databaseConfig),
        MulterModule.register({
            dest: "./uploads",
        }),
        UserModule,
        AuthModule,
        EventModule,
        PostsModule,
        MarketModule,
    ],
    controllers: [
        MarketController,
        EventController,
        PostsController,
        AuthController,
        AppController
    ],
    providers: [AppService],
})

export class AppModule { }
