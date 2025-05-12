import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { User } from "../../Users/entities/user.entity";

@Entity("gallery_items")
export class GalleryItem {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    url: string;

    @Column({ type: "text", nullable: true })
    description?: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.galleryItems, { nullable: false })
    author: User;

    @ManyToMany(() => User, (user) => user.likedGalleryItems)
    @JoinTable({
        name: "gallery_item_likes",
        joinColumn: { name: "gallery_item_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "user_id", referencedColumnName: "id" },
    })
    likedBy: User[];
}
