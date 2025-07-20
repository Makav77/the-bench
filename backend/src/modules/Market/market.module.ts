import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
  Req,
} from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MarketItem } from "./entities/market.entity";
import { MarketService } from "./market.service";
import { MarketController } from "./market.controller";
import { createInjectServiceMiddleware } from "../Utils/inject-resource-service.middleware";
import { LoadMarketItemResourceMiddleware } from "./middlewares/load-marketItem-resource.middleware";
import { NotificationsModule } from "../notifications/notifications.module";
import { UserModule } from "../Users/user.module";
import { forwardRef } from "@nestjs/common";
import { UploadModule } from "../Upload/upload.module";

const InjectMarketServiceMiddleware = createInjectServiceMiddleware(
  "marketService",
  MarketService
);

@Module({
  imports: [
    forwardRef(() => UserModule),
    NotificationsModule,
    TypeOrmModule.forFeature([MarketItem]),
    UploadModule,
  ],
  controllers: [MarketController],
  providers: [MarketService],
  exports: [MarketService],
})
export class MarketModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(InjectMarketServiceMiddleware, LoadMarketItemResourceMiddleware)
      .forRoutes({ path: "market/:id", method: RequestMethod.ALL });
  }
}
