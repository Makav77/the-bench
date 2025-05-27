import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "src/modules/Users/entities/user.entity";
import { Poll } from "./poll.entity";
import { PollOption } from "./poll-option.entity";

@Entity({ name: "poll_votes" })
export class PollVote {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.pollVotes, { nullable: false })
    voter: User;

    @ManyToOne(() => Poll, (poll) => poll.votes, { nullable: false, onDelete: "CASCADE" })
    poll: Poll;

    @ManyToOne(() => PollOption, (option) => option.votes, { nullable: false, onDelete: "CASCADE" })
    option: PollOption;
}