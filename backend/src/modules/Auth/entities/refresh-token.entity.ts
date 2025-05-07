import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../../modules/Users/entities/user.entity";

@Entity({ name: "refresh_tokens"})
export class RefreshToken {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "text" })
    token: string;

    @Column({ type: "timestamp" })
    expiresAt: Date;

    @Column({ default: false })
    revoked: boolean;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: "CASCADE" })
    user: User;
}
