import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Comment, CommentDocument } from "./comment.schema";
import { CreateCommentDTO } from "./dto/create-comment.dto";
import { UpdateCommentDTO } from "./dto/update-comment.dto";
import { User } from "../Users/entities/user.entity";

@Injectable()
export class CommentService {
    constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) {}

    async findAllComments(newsId: string, user: User): Promise<Comment[]> {
        let filter: Partial<Comment> = { newsId };

        if (user.role !== "admin") {
            filter.irisCode = user.irisCode;
        }

        const comments = await this.commentModel.find(filter).sort({ createdAt: 1 }).lean();
        return comments;
    }

    async findOneComment(commentId: string): Promise<Comment> {
        const comment = await this.commentModel.findById(commentId);

        if (!comment) {
            throw new NotFoundException("Comment not found.");
        }

        return comment;
    }

    async createComment(createCommentDTO: CreateCommentDTO, user: User): Promise<Comment> {
        const commentData = {
            ...createCommentDTO,
            irisCode: user.irisCode,
            irisName: user.irisName,
        };
        const created = new this.commentModel(commentData);
        return created.save();
    }

    async updateComment(commentId: string, user: User, updateDTO: UpdateCommentDTO): Promise<Comment> {
        const comment = await this.commentModel.findById(commentId);

        if (!comment) {
            throw new NotFoundException("Comment not found");
        }

        if (user.role !== "admin" && comment.irisCode !== user.irisCode) {
            throw new ForbiddenException("You are not allowed to edit comment from another iris.");
        }

        if (comment.authorId !== user.id && user.role !== "admin" && user.role !== "moderator") {
            throw new ForbiddenException("You are not allowed to edit this comment");
        }

        if (typeof updateDTO.content === "string") {
            comment.content = updateDTO.content;
        }

        await comment.save();
        return comment;
    }

    async removeComment(commentId: string, user: User, isAdminOrModerator: boolean): Promise<void> {
        const comment = await this.commentModel.findById(commentId);

        if (!comment) {
            throw new NotFoundException("Comment not found");
        }

        if (user.role !== "admin" && comment.irisCode !== user.irisCode) {
            throw new ForbiddenException("Not allowed to remove comment from another iris.");
        }

        if (!isAdminOrModerator && comment.authorId !== user.id) {
            throw new ForbiddenException("You are not allowed to remove this comment.");
        }

        await comment.deleteOne();
    }

    async toggleLike(commentId: string, user: User): Promise<{ liked: boolean; totalLikes: number }> {
        const comment = await this.commentModel.findById(commentId);

        if (!comment) {
            throw new NotFoundException("Comment not found");
        }

        if (user.role !== "admin" && comment.irisCode !== user.irisCode) {
            throw new ForbiddenException("Not allowed to like comment from another iris.");
        }

        const idx = comment.likedBy.indexOf(user.id);
        let liked: boolean;

        if (idx > -1) {
            comment.likedBy.splice(idx, 1);
            liked = false;
        } else {
            comment.likedBy.push(user.id);
            liked = true;
        }

        await comment.save();
        return { liked, totalLikes: comment.likedBy.length };
    }
}
