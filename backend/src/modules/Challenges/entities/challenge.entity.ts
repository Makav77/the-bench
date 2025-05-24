import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "../../../modules/Users/entities/user.entity";
// import { ChallengeRegistration } from "./challenge-registration.entity";
// import { ChallengeCompletion } from "./challenge-completion.entity";

@Entity({ name: "challenges" })
export class Challenge {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    title: string;

    @Column({ type: "text" })
    description: string;

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
}
