import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "src/modules/Users/entities/user.entity";
import { Challenge } from "./challenge.entity";

@Entity({ name: "challenge_completions" })
export class ChallengeCompletion {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "text", nullable: false })
    text?: string;

    @Column({ nullable: true })
    imageUrl?: string;

    @Column({ default: false })
    validated: boolean;

    @Column({ type: "text", nullable: true })
    rejectedReason?: string | null;

    @Column({ type: "timestamp", nullable: true })
    reviewedAt: Date | null;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.challengeCompletions, { nullable: false })
    user: User;

    @ManyToOne(() => Challenge, (challenge) => challenge.completions, { nullable: false, onDelete: "CASCADE" })
    challenge: Challenge;
}
