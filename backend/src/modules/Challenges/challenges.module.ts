import { Module, NestModule, MiddlewareConsumer, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Challenge } from "./entities/challenge.entity";
import { ChallengeRegistration } from "./entities/challenge-registration.entity";
import { ChallengeCompletion } from "./entities/challenge-completion.entity";
import { ChallengesService } from "./challenges.service";
import { ChallengesController } from "./challenges.controller";
import { PermissionsModule } from "../Permissions/permissions.module";
import { createInjectServiceMiddleware } from "../Utils/inject-resource-service.middleware";
import { LoadChallengeResourceMiddleware } from "./middlewares/load-challenge-resource.middleware";

const InjectChallengeServiceMiddleware = createInjectServiceMiddleware("challengesService", ChallengesService);

@Module({
    imports: [
        TypeOrmModule.forFeature([Challenge, ChallengeRegistration, ChallengeCompletion]),
        PermissionsModule,
    ],
    providers: [ChallengesService],
    controllers: [ChallengesController],
    exports: [ChallengesService],
})

export class ChallengesModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(InjectChallengeServiceMiddleware, LoadChallengeResourceMiddleware)
            .forRoutes(
                { path: "challenges/:id", method: RequestMethod.ALL },
                { path: "challenges/:id/validate", method: RequestMethod.ALL },
                { path: "challenges/:id/subscribe", method: RequestMethod.ALL },
                { path: "challenges/:id/complete", method: RequestMethod.ALL },
                { path: "challenges/:id/complete/:completionId", method: RequestMethod.ALL },
            );
    }
}
