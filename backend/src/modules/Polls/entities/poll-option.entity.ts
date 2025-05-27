import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Poll } from "./poll.entity";
import { PollVote } from "./poll-vote.entity";

@Entity({ name: "poll_option"})
export class PollOption {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    label: string;

    @ManyToOne(() => Poll, (poll) => poll.options, { onDelete: "CASCADE" })
    poll: Poll;

    @OneToMany(() => PollVote, (vote) => vote.option)
    votes: PollVote[];
}
