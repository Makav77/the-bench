import { GalleryModule } from './../Gallery/gallery.module';
import { GalleryController } from './../Gallery/gallery.controller';
import { FlashpostsModule } from './../FlashPosts/flashposts.module';
import { FlashPostsController } from './../FlashPosts/flashposts.controller';
import { MarketModule } from './../Market/market.module';
import { MarketController } from './../Market/market.controller';
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
import { PollController } from '../Polls/poll.controller';
import { PollModule } from '../Polls/poll.module';

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
        FlashpostsModule,
        GalleryModule,
        PollModule,
    ],
    controllers: [
        PollController,
        GalleryController,
        FlashPostsController,
        MarketController,
        EventController,
        PostsController,
        AuthController,
        AppController
    ],
    providers: [AppService],
})

export class AppModule { }
