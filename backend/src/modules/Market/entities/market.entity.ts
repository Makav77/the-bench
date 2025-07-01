import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "src/modules/Users/entities/user.entity";

@Entity("market_items")
export class MarketItem {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ length: 100 })
    title: string;

    @Column("text")
    description: string;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    price?: number;

    @Column("text", { array: true, nullable: true })
    images?: string[];

    @Column({ nullable: true })
    contactEmail?: string;

    @Column({ nullable: true })
    contactPhone?: string;

    @Column()
    irisCode: string;

    @Column()
    irisName: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.marketItems, { nullable: false })
    author: User;
}
