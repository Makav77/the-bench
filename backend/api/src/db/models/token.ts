import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user';

@Entity({ name: 'tokens' })
export class Token {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    token: string;

    @ManyToOne(() => User, user => user.tokens, { onDelete: 'CASCADE' })
    user: User;

    constructor (
        token: string,
        user: User
    ) {
        this.token = token;
        this.user = user;
    }
}