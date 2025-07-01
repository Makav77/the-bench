import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "../../../modules/Users/entities/user.entity";
import { ChallengeRegistration } from "./challenge-registration.entity";
import { ChallengeCompletion } from "./challenge-completion.entity";
import { ChallengeSubmission } from "./challenge-submission.entity";

@Entity({ name: "challenges" })
export class Challenge {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    irisCode: string;

    @Column()
    irisName: string;

    @Column()
    title: string;

    @Column({ type: "text" })
    description: string;

    @Column({ type: "text", default: "PENDING" })
    status: "PENDING" | "APPROVED" | "REJECTED";

    @Column({ type: "text", nullable: true })
    rejectedReason: string | null;

    @Column({ type: "timestamp", nullable: true })
    reviewedAt: Date | null;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @Column({ type: "timestamp" })
    startDate: Date;

    @Column({ type: "timestamp" })
    endDate: Date;

    @Column({ type: "text" })
    successCriteria: string;

    @ManyToOne(() => User, (user) => user.challengesCreated, { nullable: false })
    author: User;

    @OneToMany(() => ChallengeRegistration, (registration) => registration.challenge, { cascade: true })
    registrations: ChallengeRegistration[];

    @OneToMany(() => ChallengeCompletion, (completion) => completion.challenge, { cascade: true })
    completions: ChallengeCompletion[];

    @OneToMany(() => ChallengeSubmission, (submission) => submission.challenge, { onDelete: "CASCADE" })
    submissions: ChallengeSubmission[];
}
