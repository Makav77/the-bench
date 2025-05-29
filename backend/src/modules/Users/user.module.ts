import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { Role } from "./entities/user.entity";
import { UserRestriction } from "../Permissions/entities/user-restriction.entity";

@Module({
    imports: [TypeOrmModule.forFeature([User, Role, UserRestriction])],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
