import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum Role {
    USER = 'user',
    ADMIN = 'admin'
}

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({type: 'date'})
    dateOfBirth: Date;

    @Column()
    profilePicture: string;

    @Column({
        type: 'enum',
        enum: Role
    })
    role: Role;
}
