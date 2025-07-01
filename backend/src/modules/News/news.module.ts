import { Module, NestModule, MiddlewareConsumer, RequestMethod } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { News, NewsSchema } from "./news.schema";
import { NewsService } from "./news.service";
import { NewsController } from "./news.controller";
import { PermissionsModule } from "../Permissions/permissions.module";
import { LoadNewsResourceMiddleware } from "./middlewares/load-news-resource.middleware";
import { UserModule } from "../Users/user.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../Users/entities/user.entity";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: News.name, schema: NewsSchema }
        ]),
        TypeOrmModule.forFeature([User]),
        PermissionsModule,
        UserModule,
    ],
    controllers: [NewsController],
    providers: [NewsService],
    exports: [NewsService],
})

export class NewsModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(LoadNewsResourceMiddleware)
            .forRoutes(
                { path: "news/:id", method: RequestMethod.ALL },
                { path: "news/:id/like", method: RequestMethod.ALL },
                { path: "news/:id/likes", method: RequestMethod.ALL },
                { path: "news/:id/validate", method: RequestMethod.ALL }
            );
    }
}
