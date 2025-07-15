import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Badge } from "./entities/badge.entity";
import { UserBadge } from "./entities/user-badge.entity";
import { ShopService } from "./shop.service";
import { ShopController } from "./shop.controller";
import { User } from "../Users/entities/user.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Badge, UserBadge, User])],
    providers: [ShopService],
    controllers: [ShopController],
    exports: [ShopService],
})

export class ShopModule {}
