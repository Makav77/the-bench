import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Comment, CommentSchema } from "./comment.schema";
import { CommentService } from "./comment.service";
import { CommentController } from "./comment.controller";
import { UserModule } from "../Users/user.module";

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

export class CommentModule {}
