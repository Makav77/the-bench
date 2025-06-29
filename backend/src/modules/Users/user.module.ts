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

@Module({
    imports: [
        TypeOrmModule.forFeature([User, UserRestriction, Event, ChallengeRegistration, MarketItem]),
        EventModule,
        ChallengesModule,
        MarketModule,
        IrisModule,
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
