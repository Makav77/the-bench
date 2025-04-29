import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, ManyToMany, JoinTable, UpdateDateColumn } from "typeorm";
import { User } from "../../../modules/Users/entities/user.entity";

@Entity({ name: "events" })
export class Event {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column({ type: "timestamptz" })
    startDate: Date;

    @Column({ type: "timestamptz" })
    endDate: Date;

    @CreateDateColumn({ type: "timestamptz" })
    createdDate: Date;

    @UpdateDateColumn({ type: "timestamptz" })
    updatedDate: Date;

    @Column()
    place: string;

    @Column({ type: "int", nullable: true })
    maxNumberOfParticipants?: number;

    @Column()
    description: string;

    @ManyToOne(() => User, (user) => user.eventsCreated, { nullable: false })
    author: User;

    @ManyToMany(() => User, (user) => user.eventsParticipating, { nullable: true })
    @JoinTable({
        name: "event_participants",
        joinColumn: { name: "event_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "user_id", referencedColumnName: "id" },
    })
    participantsList?: User[];
}
