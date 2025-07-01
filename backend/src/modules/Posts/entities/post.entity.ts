import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "src/modules/Users/entities/user.entity";

@Entity("posts")
export class Posts {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    title: string;

    @Column("text")
    description: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.posts, { nullable: false })
    author: User;

    @Column()
    irisCode: string;

    @Column()
    irisName: string;
}
