import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { PollService } from '../poll.service';
import { Response, NextFunction } from 'express';
import { RequestWithResource } from 'src/modules/Utils/request-with-resource.interface';
import { Poll } from '../entities/poll.entity';

@Injectable()
export class LoadPollResourceMiddleware implements NestMiddleware {
    constructor(private readonly pollService: PollService) {}

    async use(
        req: RequestWithResource<Poll>,
        res: Response,
        next: NextFunction
    ) {
        const id = req.params.id;
        if (id) {
            const poll = await this.pollService.findOnePoll(id);
            if (!poll) {
                throw new NotFoundException("Poll not found");
            }
            req.resource = poll;
        }
        next();
    }
}
