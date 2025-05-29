import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from "typeorm";
import { Role } from "src/modules/Users/entities/user.entity";

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

    @ManyToMany(() => Role, (role) => role.permissions)
    @JoinTable({
        name: "role_permissions",
        joinColumn: { name: "permission_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "role_id", referencedColumnName: "id" },
    })
    roles: Role[]
}
