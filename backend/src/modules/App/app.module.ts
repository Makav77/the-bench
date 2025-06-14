import { AuthModule } from "./../Auth/auth.module";
import { AuthController } from "./../Auth/auth.controller";
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { databaseConfig } from "../../database/database-config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "../Users/user.module";
import { ScheduleModule } from "@nestjs/schedule";
import { EventModule } from "../Events/event.module";

@Module({
    imports: [
        ScheduleModule.forRoot(),
        AuthModule,
        TypeOrmModule.forRoot(databaseConfig),
        UserModule,
        AuthModule,
        EventModule,
    ],
    controllers: [AuthController, AppController],
    providers: [AppService],
})

export class AppModule { }
