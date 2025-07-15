import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Badge {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    imageUrl: string;

    @Column()
    cost: number;

    @Column({ default: true })
    available: boolean;
}
