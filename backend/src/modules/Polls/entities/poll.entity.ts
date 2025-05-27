import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "../../Users/entities/user.entity";
import { PollOption } from "./poll-option.entity";
import { PollVote } from "./poll-vote.entity";
import { PollType } from "../dto/create-poll.dto";

@Entity({ name: "polls"})
export class Poll {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    question: string;

    @Column({ type: "enum", enum: PollType })
    type: PollType;

    @Column({ type: "int", nullable: true })
    maxSelections?: number;

    @Column({ type: "timestamp", nullable: true })
    closesAt: Date;

    @Column({ default: false })
    manualClosed: boolean;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.pollsCreated, { nullable: false })
    author: User;

    @OneToMany(() => PollOption, (option) => option.poll, { cascade: true })
    options: PollOption[];

    @OneToMany(() => PollVote, (vote) => vote.poll)
    votes: PollVote[];
}
