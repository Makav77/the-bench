import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { UserRestriction } from "../Permissions/entities/user-restriction.entity";
import { EventModule } from "../Events/event.module";
import { ChallengesModule } from "../Challenges/challenges.module";
import { MarketModule } from "../Market/market.module";
import { ChallengeRegistration } from "../Challenges/entities/challenge-registration.entity";
import { MarketItem } from "../Market/entities/market.entity";
import { Event } from "../Events/entities/event.entity";
import { IrisModule } from "../Iris/iris.module";
import { Badge } from "../Shop/entities/badge.entity";
import { UserBadge } from "../Shop/entities/user-badge.entity";
import { forwardRef } from "@nestjs/common";
import { RecommendationService } from "./recommendation.service";
import { PollVote } from "../Polls/entities/poll-vote.entity";
import { Group } from "../chat/entities/group.entity";
import { GalleryItem } from "../Gallery/entities/gallery-item.entity";
import { MongooseModule } from "@nestjs/mongoose";
import { News, NewsSchema } from "../News/news.schema";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User, 
            UserRestriction, 
            Event, 
            ChallengeRegistration, 
            MarketItem, 
            Badge, 
            UserBadge, 
            PollVote, 
            Group,
            GalleryItem
        ]),
        MongooseModule.forFeature([{ name: News.name, schema: NewsSchema }]),
        EventModule,
        ChallengesModule,
        forwardRef(()=> MarketModule),
        IrisModule,
    ],
    controllers: [UserController],
    providers: [UserService, RecommendationService],
    exports: [UserService],
})
export class UserModule {}
