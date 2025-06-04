import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Report } from "./entities/report.entity";
import { ReportsService } from "./reports.service";
import { ReportsController } from "./reports.controller";
import { PermissionsModule } from "../Permissions/permissions.module";
import { User } from "../Users/entities/user.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Report, User]),
        PermissionsModule,
    ],
    controllers: [ReportsController],
    providers: [ReportsService],
    exports: [ReportsService]
})

export class ReportsModule {}
