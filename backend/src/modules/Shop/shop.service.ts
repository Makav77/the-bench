import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Badge } from "./entities/badge.entity";
import { UserBadge } from "./entities/user-badge.entity";
import { User } from "../Users/entities/user.entity";
import { CreateBadgeDTO } from "./dto/create-badge.dto";

@Injectable()
export class ShopService {
    constructor(
        @InjectRepository(Badge)
        private badgeRepo: Repository<Badge>,
        @InjectRepository(UserBadge)
        private userBadgeRepo: Repository<UserBadge>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) {}

    async getAllBadgesWithUserInfo(userId: string) {
        const badges = await this.badgeRepo.find();
        const userBadges = await this.userBadgeRepo.find({
            where: {
                user: {
                    id: userId
                }
            },
            relations: ["badge"],
        });

        const ownedIds = userBadges.map(ub => ub.badge.id);

        return badges.map(badge => ({
            ...badge,
            owned: ownedIds.includes(badge.id),
        }));
    }

    async createBadge(dto: CreateBadgeDTO, imageUrl: string) {
        const badge = this.badgeRepo.create({
            ...dto,
            imageUrl,
        });
        return this.badgeRepo.save(badge);
    }

    async getUserBadges(userId: string) {
        const userBadges = await this.userBadgeRepo.find({
            where: {
                user: {
                    id: userId
                }
            },
            relations: ["badge"],
        });

        return userBadges.map(ub => ub.badge);
    }

    async buyBadge(userId: string, badgeId: string) {
        const badge = await this.badgeRepo.findOne({
            where: {
                id: badgeId
            }
        });

        if (!badge || !badge.available) {
            throw new NotFoundException("Badge not available.");
        }

        const user = await this.userRepo.findOne({
            where: {
                id: userId
            }
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        const already = await this.userBadgeRepo.findOne({
            where: {
                user: {
                    id: userId
                },
                badge: {
                    id: badgeId
                }
            }
        });

        if (already) {
            throw new BadRequestException("You already own this badge!");
        }

        if (user.points < badge.cost) {
            throw new BadRequestException("Not enough points");
        }

        user.points -= badge.cost;
        await this.userRepo.save(user);

        const userBadge = this.userBadgeRepo.create({ user, badge });
        await this.userBadgeRepo.save(userBadge);
        return { success: true };
    }

    async deleteBadge(id: string): Promise<{ success: boolean }> {
        const badge = await this.badgeRepo.findOne({ where: { id } });

        if (!badge) {
            throw new NotFoundException("Badge not found");
        }

        await this.userBadgeRepo.delete({ badge: { id } });
        await this.badgeRepo.delete(id);
        return { success: true };
    }
}
