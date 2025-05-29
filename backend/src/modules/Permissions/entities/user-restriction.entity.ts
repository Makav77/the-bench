import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "src/modules/Users/entities/user.entity";
import { Permission } from "./permission.entity";

@Entity({ name: "user_restrictions" })
export class UserRestriction {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "timestamp", nullable: false })
    expiresAt: Date;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.restrictions, { nullable: false, onDelete: "CASCADE" })
    user: User;

    @ManyToOne(() => Permission, (permission) => permission.restrictions, { nullable: false, onDelete: "CASCADE" })
    permission: Permission;
}
