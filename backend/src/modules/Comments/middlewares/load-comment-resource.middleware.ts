import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { CommentService } from '../comment.service';
import { Response, NextFunction } from 'express';
import { RequestWithResource } from 'src/modules/Utils/request-with-resource.interface';
import { CommentDocument } from '../comment.schema';

@Injectable()
export class LoadCommentResourceMiddleware implements NestMiddleware {
    constructor(private readonly commentService: CommentService) {}

    async use(
        req: RequestWithResource<CommentDocument>,
        res: Response,
        next: NextFunction
    ) {
        const id = req.params.id;
        if (id) {
            const comment = await this.commentService.findOneComment(id);
            if (!comment) {
                throw new NotFoundException("Comment not found");
            }
            req.resource = comment;
        }
        next();
    }
}
