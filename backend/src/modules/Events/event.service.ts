import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan } from "typeorm";
import { Event } from "./entities/event.entity";

@Injectable()
export class EventService {
    constructor(
        @InjectRepository(Event)
        private readonly eventRepo: Repository<Event>
    ) {}

    async findAllEvents(page = 1, limit = 5): Promise<{ data: Event[]; total: number; page: number; lastPage: number; }> {
        const offset = (page - 1) * limit;
        const [data, total] = await this.eventRepo.findAndCount({
            where: {
                startDate: MoreThan(new Date()),
            },
            order: {
                startDate: "ASC",
            },
            skip: offset,
            take: limit,
        });

        const lastPage = Math.ceil(total / limit);
        return { data, total, page, lastPage };
    }

    async findOneEvent(id: string): Promise<Event> {
        const event = await this.eventRepo.findOne({ where: { id }});

        if (!event) {
            throw new NotFoundException(`Event with ID ${id} not found.`);
        }
        return event;
    }
}
