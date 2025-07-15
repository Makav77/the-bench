import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from "typeorm";
import { User } from "src/modules/Users/entities/user.entity";
import { Badge } from "./badge.entity";

@Entity()
@Unique(["user", "badge"])
export class UserBadge {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User, { eager: true })
    user: User;

    @ManyToOne(() => Badge, { eager: true })
    badge: Badge;
}
