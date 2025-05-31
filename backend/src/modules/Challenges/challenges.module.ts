import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Challenge } from "./entities/challenge.entity";
import { ChallengeRegistration } from "./entities/challenge-registration.entity";
import { ChallengeCompletion } from "./entities/challenge-completion.entity";
import { ChallengesService } from "./challenges.service";
import { ChallengesController } from "./challenges.controller";
import { PermissionsModule } from "../Permissions/permissions.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Challenge, ChallengeRegistration, ChallengeCompletion]),
        PermissionsModule,
    ],
    providers: [ChallengesService],
    controllers: [ChallengesController],
    exports: [ChallengesService],
})

export class ChallengesModule {}
