import { Injectable, NestMiddleware } from "@nestjs/common";
import { PostsService } from "../posts.service";

@Injectable()
export class InjectPostsServiceMiddleware implements NestMiddleware {
    constructor(private readonly postsService: PostsService) {}

    use(request: any, response: any, next: () => void) {
        request.postsService = this.postsService;
        next();
    }
}
