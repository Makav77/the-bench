import { Module, NestModule, MiddlewareConsumer, RequestMethod } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Comment, CommentSchema } from "./comment.schema";
import { CommentService } from "./comment.service";
import { CommentController } from "./comment.controller";
import { UserModule } from "../Users/user.module";
import { LoadCommentResourceMiddleware } from "./middlewares/load-comment-resource.middleware";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Comment.name, schema: CommentSchema }
        ]),
        UserModule,
    ],
    controllers: [CommentController],
    providers: [CommentService],
    exports: [CommentService],
})

export class CommentModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(LoadCommentResourceMiddleware)
            .forRoutes(
                { path: "news/:newsId/comments/:commentId", method: RequestMethod.ALL },
                { path: "news/:newsId/comments/:commentId/*", method: RequestMethod.ALL }
            )
    }
}
