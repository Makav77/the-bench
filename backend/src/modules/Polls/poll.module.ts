import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Poll } from "./entities/poll.entity";
import { PollOption } from "./entities/poll-option.entity";
import { PollVote } from "./entities/poll-vote.entity";
import { PollService } from "./poll.service";
import { PollController } from "./poll.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([Poll, PollOption, PollVote]),
    ],
    providers: [PollService],
    controllers: [PollController],
    exports: [PollService],
})

export class PollModule {}