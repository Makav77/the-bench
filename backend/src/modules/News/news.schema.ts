import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type NewsDocument = News & Document;

@Schema({ timestamps: true })
export class News {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    content: string;

    @Prop({ required: true })
    authorId: string;

    @Prop({ type: [String], default: [] })
    tags: string[];

    @Prop({ default: false })
    published: boolean;

    @Prop({ type: [String], default: [] })
    images: string[];

    @Prop({ type: [String], default: [] })
    likedBy: string[];
}

export const NewsSchema = SchemaFactory.createForClass(News);

NewsSchema.virtual("id").get(function () {
    return this._id.toString();
});

NewsSchema.set("toJSON", { virtuals: true, versionKey: false });
NewsSchema.set("toObject", { virtuals: true });
