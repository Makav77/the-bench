import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Comment, CommentDocument } from "./comment.schema";
import { CreateCommentDTO } from "./dto/create-comment.dto";
import { UpdateCommentDTO } from "./dto/update-comment.dto";

@Injectable()
export class CommentService {
    constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) {}

    async findAllComments(newsId: string): Promise<Comment[]> {
        const comments = await this.commentModel.find({ newsId }).sort({ createdAt: 1 }).lean();
        return comments;
    }

    async createComment(createCommentDTO: CreateCommentDTO): Promise<Comment> {
        const created = new this.commentModel(createCommentDTO);
        return created.save();
    }

    async updateComment(commentId: string, userId: string, updateDTO: UpdateCommentDTO): Promise<Comment> {
        const comment = await this.commentModel.findById(commentId);

        if (!comment) {
            throw new NotFoundException("Comment not found");
        }
        if (comment.authorId !== userId) {
            throw new ForbiddenException("You can't edit this comment");
        }

        if (typeof updateDTO.content === "string") {
            comment.content = updateDTO.content;
        }
        await comment.save();
        return comment;
    }

    async removeComment(commentId: string, userId: string, isAdminOrModerator: boolean): Promise<void> {
        const comment = await this.commentModel.findById(commentId);

        if (!comment) {
            throw new NotFoundException("Comment not found");
        }

        if (!isAdminOrModerator && comment.authorId !== userId) {
            throw new ForbiddenException("You are not allowed to remove this comment.");
        }

        await comment.deleteOne();
    }

    async toggleLike(commentId: string, userId: string): Promise<{ liked: boolean; totalLikes: number }> {
        const comment = await this.commentModel.findById(commentId);

        if (!comment) {
            throw new NotFoundException("Comment not found");
        }

        const idx = comment.likedBy.indexOf(userId);
        let liked: boolean;

        if (idx > -1) {
            comment.likedBy.splice(idx, 1);
            liked = false;
        } else {
            comment.likedBy.push(userId);
            liked = true;
        }

        await comment.save();
        return { liked, totalLikes: comment.likedBy.length };
    }
}
