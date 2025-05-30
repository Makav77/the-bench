import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission } from "./entities/permission.entity";
import { UserRestriction } from "./entities/user-restriction.entity";
import { PermissionsService } from "./permissions.service";
import { PermissionsController } from "./permissions.controller";
import { PermissionGuard } from "./guards/permission.guard";
import { APP_GUARD } from "@nestjs/core";

@Module({
    imports: [
        TypeOrmModule.forFeature([Permission, UserRestriction]),
    ],
    providers: [PermissionsService, { provide: APP_GUARD, useClass: PermissionGuard }],
    controllers: [PermissionsController],
    exports: [PermissionsService],
})

export class PermissionsModule {}
