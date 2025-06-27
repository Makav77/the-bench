import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { PostsService } from '../posts.service';
import { Response, NextFunction } from 'express';
import { RequestWithResource } from 'src/modules/Utils/request-with-resource.interface';
import { Posts } from '../entities/post.entity';

@Injectable()
export class LoadPostResourceMiddleware implements NestMiddleware {
    constructor(private readonly postsService: PostsService) {}

    async use(
        req: RequestWithResource<Posts>,
        res: Response,
        next: NextFunction
    ) {
        const id = req.params.id;
        if (id) {
            const post = await this.postsService.findOnePost(id);
            if (!post) {
                throw new NotFoundException('Post not found');
            }
            req.resource = post;
        }
        next();
    }
}
