import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user';

export enum State {
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    CLOSED = 'closed',
}

export enum Tag {
    CLEANING = 'cleaning',
    SHOPPING = 'shopping',
    BABYSITTING = 'babysitting',
    OTHER = 'other'
}

@Entity({ name: 'postings' })
export class Posting {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column({
        type: 'enum',
        enum: State,
        default: State.OPEN
    })
    state: State;

    @CreateDateColumn({type: "timestamptz"})
    creationDate: Date;

    @Column({type: "timestamptz"})
    endDate: Date;

    @Column({
        type: 'enum',
        enum: Tag,
        array: true,
        default: []
    })
    tags: Tag[];

    @ManyToOne(() => User, user => user.postings)
    userHost: User;

    constructor (
        title: string,
        description: string,
        state: State,
        creationDate: Date,
        endDate: Date,
        tags: Tag[],
        userHost: User
    ) {
        this.title = title;
        this.description = description;
        this.state = state;
        this.creationDate = creationDate;
        this.endDate = endDate;
        this.tags = tags;
        this.userHost = userHost;
    }
}