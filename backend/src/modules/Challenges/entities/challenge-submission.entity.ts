import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Challenge } from "./challenge.entity";
import { User } from "src/modules/Users/entities/user.entity";

export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

@Entity("challenge_submission")
export class ChallengeSubmission {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "text", nullable: true })
    proof: string | null;

    @Column({ type: "text", default: "PENDING" })
    status: SubmissionStatus;

    @Column({ type: "text", nullable: true })
    rejectedReason: string | null;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @Column({ type: "timestamp", nullable: true })
    reviewedAt: Date | null;

    @ManyToOne(() => Challenge, (challenge) => challenge.id, { onDelete: "CASCADE" })
    challenge: Challenge;

    @ManyToOne(() => User, (user) => user.id, { onDelete: "CASCADE" })
    submitter: User;
}
