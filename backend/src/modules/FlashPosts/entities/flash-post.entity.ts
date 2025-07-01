import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "src/modules/Users/entities/user.entity";

@Entity("flash_posts")
export class FlashPost {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    title: string;

    @Column("text")
    description: string;

    @Column()
    irisCode: string;

    @Column()
    irisName: string;

    @CreateDateColumn({ type: "timestamptz" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamptz" })
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.flashPosts, { nullable: false })
    author: User;
}
