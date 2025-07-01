import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission } from "./entities/permission.entity";
import { UserRestriction } from "./entities/user-restriction.entity";
import { PermissionsService } from "./permissions.service";
import { PermissionsController } from "./permissions.controller";
import { User } from "../Users/entities/user.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Permission, User, UserRestriction]),
    ],
    providers: [PermissionsService],
    controllers: [PermissionsController],
    exports: [PermissionsService],
})

export class PermissionsModule {}
