import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, ManyToMany, JoinTable, UpdateDateColumn } from "typeorm";
import { User } from "../../../modules/Users/entities/user.entity";

@Entity({ name: "events" })
export class Event {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    irisCode: string;

    @Column()
    irisName: string;

    @Column()
    name: string;

    @Column({ type: "timestamp" })
    startDate: Date;

    @Column({ type: "timestamp" })
    endDate: Date;

    @CreateDateColumn({ type: "timestamp" })
    createdDate: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedDate: Date;

    @Column()
    place: string;

    @Column({ type: "int", nullable: true })
    maxNumberOfParticipants?: number | null;

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
