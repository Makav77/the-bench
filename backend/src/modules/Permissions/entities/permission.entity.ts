import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { UserRestriction } from "./user-restriction.entity";

@Entity({ name: "permissions" })
export class Permission {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "text", unique: true })
    code: string;

    @Column({ type: "text" })
    description: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @OneToMany(() => UserRestriction, (userRestriction) => userRestriction.permission)
    restrictions: UserRestriction[];
}
