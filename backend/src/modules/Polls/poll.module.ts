import { Module, NestModule, MiddlewareConsumer, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Poll } from "./entities/poll.entity";
import { PollOption } from "./entities/poll-option.entity";
import { PollVote } from "./entities/poll-vote.entity";
import { PollService } from "./poll.service";
import { PollController } from "./poll.controller";
import { PermissionsModule } from "../Permissions/permissions.module";
import { createInjectServiceMiddleware } from "../Utils/inject-resource-service.middleware";
import { LoadPollResourceMiddleware } from "./middlewares/load-poll-resource.middleware";

const InjectPollServiceMiddleware = createInjectServiceMiddleware("pollService", PollService);

@Module({
    imports: [
        TypeOrmModule.forFeature([Poll, PollOption, PollVote]),
        PermissionsModule,
    ],
    providers: [PollService],
    controllers: [PollController],
    exports: [PollService],
})

export class PollModule implements NestModule {
    configure (consumer: MiddlewareConsumer) {
        consumer
            .apply(InjectPollServiceMiddleware, LoadPollResourceMiddleware)
            .forRoutes(
                { path: "polls/:id", method: RequestMethod.ALL },
                { path: "polls/:id/vote", method: RequestMethod.ALL },
                { path: "polls/:id/close", method: RequestMethod.ALL },
            );
    }
}
