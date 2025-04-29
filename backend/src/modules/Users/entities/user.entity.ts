import { RefreshToken } from 'src/modules/Auth/entities/refresh-token.entity';
import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';

export enum Role {
    USER = "user",
    ADMIN = "admin"
}

@Entity({ name: "users" })
export class User {
    @PrimaryColumn({ unique: true })
    id: string;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: "timestamptz" })
    dateOfBirth: Date;

    @Column()
    profilePicture?: string;

    @Column({
        type: "enum",
        enum: Role
    })
    role: Role;

    @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
    refreshTokens: RefreshToken[];
}
