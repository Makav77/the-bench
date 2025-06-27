import { Injectable, NestMiddleware, NotFoundException } from "@nestjs/common";
import { PostsService } from "../posts.service";

@Injectable()
export class LoadPostResourceMiddleware implements NestMiddleware {
    constructor(private readonly postsService: PostsService) {}

    async use(request: any, response: any, next: () => void) {
        const postId = request.params.id;
        if (postId) {
            const post = await this.postsService.findOnePost(postId);
            if (!post) {
                throw new NotFoundException("Post not found");
            }
            request.resource = post;
        }
        next();
    }
}
