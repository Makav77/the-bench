import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { NewsService } from '../news.service';
import { Response, NextFunction } from 'express';
import { RequestWithResource } from 'src/modules/Utils/request-with-resource.interface';
import { NewsDocument } from '../news.schema';

@Injectable()
export class LoadNewsResourceMiddleware implements NestMiddleware {
    constructor(private readonly newsService: NewsService) {}

    async use(
        req: RequestWithResource<NewsDocument>,
        res: Response,
        next: NextFunction
    ) {
        const id = req.params.id;
        if (id) {
            const news = await this.newsService.findOneNews(id);
            if (!news) {
                throw new NotFoundException("News not found");
            }
            req.resource = news;
        }
        next();
    }
}
