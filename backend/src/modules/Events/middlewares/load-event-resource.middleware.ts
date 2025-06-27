import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { EventService } from '../event.service';
import { Response, NextFunction } from 'express';
import { RequestWithResource } from 'src/modules/Utils/request-with-resource.interface';
import { Event } from '../entities/event.entity';

@Injectable()
export class LoadEventResourceMiddleware implements NestMiddleware {
    constructor(private readonly eventService: EventService) {}

    async use(
        req: RequestWithResource<Event>,
        res: Response,
        next: NextFunction
    ) {
        const id = req.params.id;
        if (id) {
            const event = await this.eventService.findOneEvent(id);
            if (!event) {
                throw new NotFoundException("Event not found");
            }
            req.resource = event;
        }
        next();
    }
}
