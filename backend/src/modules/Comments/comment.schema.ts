import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
    @Prop({ required: true })
    newsId: string;

    @Prop({ required: true })
    authorId: string;

    @Prop({ required: true })
    authorName: string;

    @Prop({ required: true })
    authorAvatar: string;

    @Prop({ required: true })
    content: string;

    @Prop({ type: [String], default: [] })
    likedBy: string[];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.virtual("id").get(function () {
    return this._id.toString();
});
CommentSchema.set("toJSON", { virtuals: true, versionKey: false });
