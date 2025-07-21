import { Module, NestModule, MiddlewareConsumer, RequestMethod, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Event } from "./entities/event.entity";
import { EventService } from "./event.service";
import { EventController } from "./event.controller";
import { PermissionsModule } from "../Permissions/permissions.module";
import { createInjectServiceMiddleware } from "../Utils/inject-resource-service.middleware";
import { LoadEventResourceMiddleware } from "./middlewares/load-event-resource.middleware";
import { UserModule } from "../Users/user.module";
import { NotificationsModule } from "../notifications/notifications.module";

const InjectEventServiceMiddleware = createInjectServiceMiddleware("eventService", EventService);

@Module({
    imports: [
        TypeOrmModule.forFeature([Event]),
        PermissionsModule,
        forwardRef(() => UserModule),
        NotificationsModule
    ],
    providers: [EventService],
    controllers: [EventController],
    exports: [EventService],
})

export class EventModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(InjectEventServiceMiddleware, LoadEventResourceMiddleware)
            .forRoutes(
                { path: "events/:id", method: RequestMethod.ALL },
                { path: "events/:id/subscribe", method: RequestMethod.ALL },
                { path: "events/:id/participants/:userId", method: RequestMethod.ALL },
            );
    }
}
