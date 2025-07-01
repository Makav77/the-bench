import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { FlashPostsService } from '../flashposts.service';
import { Response, NextFunction } from 'express';
import { RequestWithResource } from 'src/modules/Utils/request-with-resource.interface';
import { FlashPost } from '../entities/flash-post.entity';

@Injectable()
export class LoadFlashPostResourceMiddleware implements NestMiddleware {
    constructor(private readonly flashPostsService: FlashPostsService) {}

    async use(
        req: RequestWithResource<FlashPost>,
        res: Response,
        next: NextFunction
    ) {
        const id = req.params.id;
        if (id) {
            const flashpost = await this.flashPostsService.findOneFlashPost(id);
            if (!flashpost) {
                throw new NotFoundException("Flashpost not found");
            }
            req.resource = flashpost;
        }
        next();
    }
}
