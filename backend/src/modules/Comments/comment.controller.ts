import { Controller, Post, Body, Param, Delete, Patch, Get, UseGuards, Request, ForbiddenException } from "@nestjs/common";
import { CommentService } from "./comment.service";
import { CreateCommentDTO } from "./dto/create-comment.dto";
import { UpdateCommentDTO } from "./dto/update-comment.dto";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";
import { Comment } from "./comment.schema";

@Controller("news/:newsId/comments")
export class CommentController {

    constructor(private readonly commentService: CommentService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllComments(@Param("newsId") newsId: string): Promise<Comment[]> {
        return this.commentService.findAllComments(newsId);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createComment(
        @Param("newsId") newsId: string,
        @Body() createCommentDTO: CreateCommentDTO,
        @Request() req: { user: { id: string } }
    ): Promise<Comment> {
        return this.commentService.createComment({
            ...createCommentDTO,
            newsId,
            authorId: req.user.id
        });
    }

    @UseGuards(JwtAuthGuard)
    @Patch(":commentId")
    async updateComment(
        @Param("commentId") commentId: string,
        @Request() req: { user: { id: string } },
        @Body() updateCommentDTO: UpdateCommentDTO
    ): Promise<Comment> {
        return this.commentService.updateComment(commentId, req.user.id, updateCommentDTO);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":commentId")
    async removeComment(
        @Param("commentId") commentId: string,
        @Request() req: { user: { id: string; role: string } }
    ): Promise<{ deleted: boolean }> {
        const isAdminOrModerator = ["admin", "moderator"].includes(req.user.role);
        await this.commentService.removeComment(commentId, req.user.id, isAdminOrModerator);
        return { deleted: true };
    }

    @UseGuards(JwtAuthGuard)
    @Post(":commentId/like")
    async toggleLike(
        @Param("newsId") newsId: string,
        @Param("commentId") commentId: string,
        @Request() req: { user: { id: string } }
    ): Promise<{ liked: boolean; totalLikes: number }> {
        return this.commentService.toggleLike(commentId, req.user.id);
    }
}
