import { Injectable, NotFoundException, OnModuleInit, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThanOrEqual, MoreThan } from "typeorm";
import { Permission } from "./entities/permission.entity";
import { UserRestriction } from "./entities/user-restriction.entity";
import { User } from "../Users/entities/user.entity";
import { DEFAULT_PERMISSIONS } from "./ListPermissions";

@Injectable()
export class PermissionsService implements OnModuleInit {
    constructor(
        @InjectRepository(Permission)
        private permissionRepo: Repository<Permission>,
        @InjectRepository(UserRestriction)
        private userRestrictionRepo: Repository<UserRestriction>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) {}

    async onModuleInit() {
        for (const { code, description } of DEFAULT_PERMISSIONS) {
            const exists = await this.permissionRepo.findOneBy({ code });
            if (!exists) {
                await this.permissionRepo.save(
                    this.permissionRepo.create({ code, description })
                );
            }
        }
    }

    async restrictUser(user: User, permissionCode: string, targetUserId: string, reason: string, expiresAt: Date): Promise<UserRestriction> {
        const permission = await this.permissionRepo.findOneBy({ code: permissionCode });

        if (!permission) {
            throw new NotFoundException("Permission not found");
        }

        const targetUser = await this.userRepo.findOneBy({ id: targetUserId });
        if (!targetUser) {
            throw new NotFoundException("User not found.");
        }

        const alreadyRestricted = await this.userRestrictionRepo.count({
            where: {
                user: { id: targetUserId },
                permission: { id: permission.id },
                expiresAt: MoreThan(new Date()),
            },
        });
        if (alreadyRestricted > 0) {
            throw new BadRequestException("User already restricted.");
        }

        const restriction = this.userRestrictionRepo.create({ user: targetUser, permission, expiresAt, reason });
        return this.userRestrictionRepo.save(restriction);
    }

    async removeRestriction(user: User, permissionCode: string): Promise<void> {
        const permission = await this.permissionRepo.findOneBy({ code: permissionCode });

        if (!permission) {
            throw new NotFoundException("Permission not found");
        }

        await this.userRestrictionRepo.delete({ user: { id: user.id }, permission: { id: permission.id }, });
    }

    async isRestricted(user: User, permissionCode: string): Promise<boolean> {
        const permission = await this.permissionRepo.findOneBy({ code: permissionCode });

        if (!permission) {
            throw new NotFoundException("Permission not found");
        }

        await this.userRestrictionRepo.delete({ expiresAt: LessThanOrEqual(new Date()) });

        const count = await this.userRestrictionRepo.count({
            where: {
                user: { id: user.id },
                permission: { id: permission.id },
                expiresAt: MoreThan(new Date()),
            },
        });
        return count > 0;
    }
}
