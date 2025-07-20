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
import { postgresDatabaseConfig } from "../../database/postgres-database-config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "../Users/user.module";
import { ScheduleModule } from "@nestjs/schedule";
import { EventModule } from "../Events/event.module";
import { EventController } from '../Events/event.controller';
import { PollController } from '../Polls/poll.controller';
import { PollModule } from '../Polls/poll.module';
import { PlacesModule } from '../Places/places.module';
import { ConfigModule } from '@nestjs/config';
import { ChallengesModule } from '../Challenges/challenges.module';
import { ChallengesController } from '../Challenges/challenges.controller';
import { PermissionsModule } from '../Permissions/permissions.module';
import { PermissionsController } from '../Permissions/permissions.controller';
import { ReportsModule } from '../Reports/reports.module';
import { ReportsController } from '../Reports/reports.controller';
import { ChatModule } from '../Chat/chat.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MONGO_URI } from 'src/database/mongo-database-config';
import { NewsModule } from '../News/news.module';
import { NewsController } from '../News/news.controller';
import { CommentController } from '../Comments/comment.controller';
import { CommentModule } from '../Comments/comment.module';
import { IrisController } from '../Iris/iris.controller';
import { IrisModule } from '../Iris/iris.module';
import { ShopModule } from '../Shop/shop.module';
import { ShopController } from '../Shop/shop.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { NotificationsController } from '../notifications/notifications.controller';
import { UploadModule } from '../Upload/upload.module';
import { UploadController } from '../Upload/upload.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ScheduleModule.forRoot(),
        TypeOrmModule.forRoot({
            ...postgresDatabaseConfig,
            logging: true,
            logger: "advanced-console",
        }),
        MongooseModule.forRoot(MONGO_URI, {}),
        UserModule,
        AuthModule,
        EventModule,
        PostsModule,
        MarketModule,
        FlashpostsModule,
        GalleryModule,
        PollModule,
        PlacesModule,
        ChallengesModule,
        PermissionsModule,
        ReportsModule,
        ChatModule,
        NewsModule,
        CommentModule,
        IrisModule,
        ShopModule,
        NotificationsModule,
        UploadModule,
    ],
    controllers: [
        ChallengesController,
        PollController,
        GalleryController,
        FlashPostsController,
        MarketController,
        EventController,
        PostsController,
        AuthController,
        AppController,
        PermissionsController,
        ReportsController,
        NewsController,
        CommentController,
        IrisController,
        ShopController,
        NotificationsController,
        UploadController,
    ],
    providers: [AppService],
})

export class AppModule { }
