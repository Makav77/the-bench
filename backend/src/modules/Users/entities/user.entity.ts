import { RefreshToken } from '../../../modules/Auth/entities/refresh-token.entity';
import { Entity, PrimaryColumn, Column, OneToMany, ManyToMany, OneToOne } from 'typeorm';
import { Event } from '../../../modules/Events/entities/event.entity';
import { Posts } from 'src/modules/Posts/entities/post.entity';
import { MarketItem } from 'src/modules/Market/entities/market.entity';
import { FlashPost } from 'src/modules/FlashPosts/entities/flash-post.entity';

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

    @Column({ type: "timestamp" })
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

    @OneToMany(() => Event, (event) => event.author)
    eventsCreated: Event[];

    @ManyToMany(() => Event, (event) => event.participantsList)
    eventsParticipating: Event[];

    @OneToMany(() => Posts, (post) => post.author)
    posts: Posts[];

    @OneToMany(() => MarketItem, (items) => items.author)
    marketItems: MarketItem[];

    @OneToMany(() => FlashPost, (flashPost) => flashPost.author)
    flashPosts: FlashPost[];
}
