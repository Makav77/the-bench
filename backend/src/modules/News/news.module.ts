import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { News, NewsSchema } from "./news.schema";
import { NewsService } from "./news.service";
import { NewsController } from "./news.controller";
import { PermissionsModule } from "../Permissions/permissions.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: News.name, schema: NewsSchema }
        ]),
        PermissionsModule,
    ],
    controllers: [NewsController],
    providers: [NewsService],
    exports: [NewsService],
})

export class NewsModule {}
