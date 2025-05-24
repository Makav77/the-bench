import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "src/modules/Users/entities/user.entity";
import { Challenge } from "./challenge.entity";

@Entity({ name: "challenge_registration" })
export class ChallengeRegistration {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.challengeRegistrations, { nullable: false })
    user: User;

    @ManyToOne(() => Challenge, (challenge) => challenge.registrations, { nullable: false, onDelete: "CASCADE" })
    challenge: Challenge;
}
