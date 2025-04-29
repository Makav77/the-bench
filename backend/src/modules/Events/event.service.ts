import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan } from "typeorm";
import { Event } from "./entities/event.entity";
import { CreateEventDTO } from "./dto/create-event.dto";
import { UpdateEventDTO } from "./dto/update-event.dto";
import { User, Role } from "../Users/entities/user.entity";

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

    async create(createEventDTO: CreateEventDTO, author: User): Promise<Event> {
        const event = this.eventRepo.create({
            ...createEventDTO,
            author,
            participantsList: [],
        });
        return this.eventRepo.save(event);
    }

    async update(id: string, updateEventDTO: UpdateEventDTO, user: User): Promise <Event> {
        const event = await this.eventRepo.findOne({ where: { id }, relations: ["author"] });
        if (!event) {
            throw new ForbiddenException("Evenement introuvable");
        }

        if (event.author.id !== user.id && user.role !== Role.ADMIN) {
            throw new ForbiddenException("Vous n'êtes pas autorisé à modifier cet événement");
        }

        const updated = this.eventRepo.merge(event, updateEventDTO);
        return this.eventRepo.save(updated);
    }
}
