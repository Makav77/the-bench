import { Module, NestModule, MiddlewareConsumer, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Report } from "./entities/report.entity";
import { ReportsService } from "./reports.service";
import { ReportsController } from "./reports.controller";
import { PermissionsModule } from "../Permissions/permissions.module";
import { User } from "../Users/entities/user.entity";
import { createInjectServiceMiddleware } from "../Utils/inject-resource-service.middleware";
import { LoadReportResourceMiddleware } from "./middlewares/load-report-resource.middleware";

const InjectReportsServiceMiddleware = createInjectServiceMiddleware("reportsService", ReportsService);

@Module({
    imports: [
        TypeOrmModule.forFeature([Report, User]),
        PermissionsModule,
    ],
    controllers: [ReportsController],
    providers: [ReportsService],
    exports: [ReportsService]
})

export class ReportsModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(InjectReportsServiceMiddleware, LoadReportResourceMiddleware)
            .forRoutes({ path: "reports/:id", method: RequestMethod.ALL });
    }
}
