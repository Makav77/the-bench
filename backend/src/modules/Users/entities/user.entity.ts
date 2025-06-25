import { RefreshToken } from '../../../modules/Auth/entities/refresh-token.entity';
import { Entity, PrimaryColumn, Column, OneToMany, ManyToMany, OneToOne, JoinTable } from 'typeorm';
import { Event } from '../../../modules/Events/entities/event.entity';
import { Posts } from 'src/modules/Posts/entities/post.entity';
import { MarketItem } from 'src/modules/Market/entities/market.entity';
import { FlashPost } from 'src/modules/FlashPosts/entities/flash-post.entity';
import { GalleryItem } from 'src/modules/Gallery/entities/gallery-item.entity';
import { Poll } from 'src/modules/Polls/entities/poll.entity';
import { PollVote } from 'src/modules/Polls/entities/poll-vote.entity';
import { Challenge } from 'src/modules/Challenges/entities/challenge.entity';
import { ChallengeRegistration } from 'src/modules/Challenges/entities/challenge-registration.entity';
import { ChallengeCompletion } from 'src/modules/Challenges/entities/challenge-completion.entity';
import { Permission } from 'src/modules/Permissions/entities/permission.entity';
import { UserRestriction } from 'src/modules/Permissions/entities/user-restriction.entity';
import { Report } from 'src/modules/Reports/entities/report.entity';

export enum Role {
    USER = "user",
    MODERATOR = "moderator",
    ADMIN = "admin",
}

@Entity({ name: "users" })
export class User {
    @PrimaryColumn({ unique: true })
    id: string;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column()
    address: string;

    @Column({ nullable: true })
    irisCode: string;

    @Column({ nullable: true })
    irisName: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: "timestamp" })
    dateOfBirth: Date;

    @Column()
    profilePicture: string;

    @Column({ type: "int", default: 0 })
    points: number;

    @Column({
        type: "enum",
        enum: Role,
        default: Role.USER
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

    @OneToMany(() => GalleryItem, (galleryItem) => galleryItem.author)
    galleryItems: GalleryItem[];

    @ManyToMany(() => GalleryItem, (galleryItem) => galleryItem.likedBy)
    likedGalleryItems: GalleryItem[];

    @OneToMany(() => Poll, (poll) => poll.author)
    pollsCreated: Poll[];

    @OneToMany(() => PollVote, (vote) => vote.voter)
    pollVotes: PollVote[];

    @OneToMany(() => Challenge, (challenge) => challenge.author)
    challengesCreated: Challenge[];

    @OneToMany(() => ChallengeRegistration, (registration) => registration.user)
    challengeRegistrations: ChallengeRegistration[];

    @OneToMany(() => ChallengeCompletion, (completion) => completion.user)
    challengeCompletions: ChallengeCompletion[];

    @ManyToMany(() => Permission, { eager: true })
    @JoinTable({
        name: "user_permissions",
        joinColumn: { name: "user_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "permission_id", referencedColumnName: "id" },
    })
    permissions: Permission[];

    @OneToMany(() => UserRestriction, (ur) => ur.user)
    restrictions: UserRestriction[];

    @OneToMany(() => Report, (report) => report.reporter)
    reportsMade: Report[];

    @OneToMany(() => Report, (report) => report.reportedUser)
    reportsReceived: Report[];

    @ManyToMany(() => User, (user) => user.friends)
    @JoinTable({ name: "user_friends" })
    friends: User[];

    @ManyToMany(() => User, (user) => user.friendRequestsReceived)
    @JoinTable({ name: "friend_requests_sent" })
    friendRequestsSent: User[];

    @ManyToMany(() => User, (user) => user.friendRequestsSent)
    friendRequestsReceived: User[];
}
