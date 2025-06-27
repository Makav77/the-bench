import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { PostsService } from '../posts.service';

@Injectable()
export class LoadPostResourceMiddleware implements NestMiddleware {
    constructor(private readonly postsService: PostsService) {}

    async use(req: any, res: any, next: () => void) {
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
