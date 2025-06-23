import { Controller, Post, Body, Param, Delete, Patch, Get, UseGuards, Request, ForbiddenException } from "@nestjs/common";
import { CommentService } from "./comment.service";
import { CreateCommentDTO } from "./dto/create-comment.dto";
import { UpdateCommentDTO } from "./dto/update-comment.dto";
import { UserService } from "../Users/user.service";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";
import { Comment } from "./comment.schema";

@Controller("news/:newsId/comments")
export class CommentController {

    constructor(
        private readonly commentService: CommentService,
        private readonly userService: UserService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllComments(@Param("newsId") newsId: string): Promise<Comment[]> {
        return this.commentService.findAllComments(newsId);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(
        @Param("newsId") newsId: string,
        @Body("content") content: string,
        @Request() req: { user: { id: string; firstname: string; lastname: string; avatar: string } }
    ): Promise<Comment> {
        const user = req.user;
        const userPicture = await this.userService.findOne(user.id);
        const avatar = userPicture.profilePicture;
        const dto: CreateCommentDTO = {
            content,
            newsId,
            authorId: user.id,
            authorName: `${user.firstname} ${user.lastname}`,
            authorAvatar: avatar,
        };
        return this.commentService.createComment(dto);
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
        console.log('-------------------------------------------------------------------------------------------------toggleLike', { newsId, commentId });
        return this.commentService.toggleLike(commentId, req.user.id);
    }
}
