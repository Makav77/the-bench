import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Event } from "./entities/event.entity";
import { EventService } from "./event.service";
import { EventController } from "./event.controller";
import { PermissionsModule } from "../Permissions/permissions.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Event]),
        PermissionsModule,
    ],
    providers: [EventService],
    controllers: [EventController],
    exports: [EventService],
})

export class EventModule {}
