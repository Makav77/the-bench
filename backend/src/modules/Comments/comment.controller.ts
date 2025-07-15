import { Controller, Post, Body, Param, Delete, Patch, Get, UseGuards, Req, NotFoundException } from "@nestjs/common";
import { CommentService } from "./comment.service";
import { CreateCommentDTO } from "./dto/create-comment.dto";
import { UpdateCommentDTO } from "./dto/update-comment.dto";
import { UserService } from "../Users/user.service";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";
import { Comment, CommentDocument } from "./comment.schema";
import { User } from "../Users/entities/user.entity";
import { IrisGuard } from "../Auth/guards/iris.guard";
import { RequestWithResource } from "../Utils/request-with-resource.interface";
import { Resource } from "../Utils/resource.decorator";

@Controller("news/:newsId/comments")
export class CommentController {

    constructor(
        private readonly commentService: CommentService,
        private readonly userService: UserService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllComments(
        @Param("newsId") newsId: string,
        @Req() req: RequestWithResource<Comment>
    ): Promise<Comment[]> {
        const user = req.user as User;
        return this.commentService.findAllComments(newsId, user);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(
        @Param("newsId") newsId: string,
        @Body("content") content: string,
        @Req() req: RequestWithResource<Comment>
    ): Promise<Comment> {
        const user = req.user as User;
        const userDB = await this.userService.findOne(user.id);
        const dto: CreateCommentDTO = {
            content,
            newsId,
            authorId: user.id,
            authorName: `${user.firstname} ${user.lastname}`,
            authorAvatar: userDB.profilePicture,
            irisCode: user.irisCode,
            irisName: user.irisName,
        };
        return this.commentService.createComment(dto, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Patch(":commentId")
    async updateComment(
        @Resource() comment: CommentDocument,
        @Body() updateCommentDTO: UpdateCommentDTO,
        @Req() req: RequestWithResource<Comment>
    ): Promise<Comment> {
        const user = req.user as User;
        return this.commentService.updateComment(comment.id, user, updateCommentDTO);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Delete(":commentId")
    async removeComment(
        @Resource() comment: CommentDocument,
        @Req() req: RequestWithResource<Comment>
    ): Promise<{ deleted: boolean }> {
        const user = req.user as User;
        const isAdminOrModerator = ["admin", "moderator"].includes(user.role);
        await this.commentService.removeComment(comment.id, user, isAdminOrModerator);
        return { deleted: true };
    }

    @UseGuards(JwtAuthGuard)
    @Post(":commentId/like")
    async toggleLike(
        @Param("newsId") newsId: string,
        @Param("commentId") commentId: string,
        @Req() req: RequestWithResource<Comment>
    ): Promise<{ liked: boolean; totalLikes: number }> {
        const comment = await this.commentService.findOneComment(commentId);

        if (!comment) {
            throw new NotFoundException("Comment not found.");
        }

        req.resource = comment;
        const user = req.user as User;
        return this.commentService.toggleLike(commentId, user);
    }
}
