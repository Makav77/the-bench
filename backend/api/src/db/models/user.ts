import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Token } from './token';
import { Posting } from './posting';

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

    @OneToMany(() => Token, token => token.user)
    tokens: Token[];

    @OneToMany(() => Posting, posting => posting.userHost)
    postings: Posting[];

    constructor (
        id: number,
        firstname: string,
        lastname: string,
        email: string,
        password: string,
        dateOfBirth: Date,
        profilePicture: string,
        role: Role,
        tokens: Token[],
        postings: Posting[]
    ) {
        this.id = id;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
        this.dateOfBirth = dateOfBirth;
        this.profilePicture = profilePicture;
        this.role = role;
        this.tokens = tokens;
        this.postings = postings;
    }
}
