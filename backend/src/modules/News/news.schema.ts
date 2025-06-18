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
}

export const NewsSchema = SchemaFactory.createForClass(News);
