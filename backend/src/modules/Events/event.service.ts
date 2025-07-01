import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan, FindOptionsWhere } from "typeorm";
import { Event } from "./entities/event.entity";
import { CreateEventDTO } from "./dto/create-event.dto";
import { UpdateEventDTO } from "./dto/update-event.dto";
import { User, Role } from "../Users/entities/user.entity";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class EventService {
    constructor(
        @InjectRepository(Event)
        private readonly eventRepo: Repository<Event>
    ) { }

    async findAllEvents(page = 1, limit = 5, user: User): Promise<{ data: Event[]; total: number; page: number; lastPage: number; }> {
        const offset = (page - 1) * limit;

        let whereCondition: FindOptionsWhere<Event>[] | FindOptionsWhere<Event> = { endDate: MoreThan(new Date()) };
        if (user.role !== Role.ADMIN) {
            whereCondition = [
                { endDate: MoreThan(new Date()), irisCode: user.irisCode },
                { endDate: MoreThan(new Date()), irisCode: "all" }
            ];
        }
    
        const [data, total] = await this.eventRepo.findAndCount({
            where: whereCondition,
            order: { startDate: "ASC" },
            skip: offset,
            take: limit,
            relations: ["participantsList", "author"],
        });

        const lastPage = Math.ceil(total / limit);
        return { data, total, page, lastPage };
    }

    async findOneEvent(id: string): Promise<Event> {
        const event = await this.eventRepo.findOne({ 
            where: { id },
            relations: ["author", "participantsList"],
        });

        if (!event) {
            throw new NotFoundException(`Event with ID ${id} not found.`);
        }
        return event;
    }

    async createEvent(createEventDTO: CreateEventDTO, author: User): Promise<Event> {
        let irisCode = author.irisCode;
        let irisName = author.irisName;
        if (author.role === Role.ADMIN) {
            irisCode = "all";
            irisName = "all";
        }

        const event = this.eventRepo.create({
            ...createEventDTO,
            author,
            participantsList: [],
            irisCode,
            irisName,
        });
        return this.eventRepo.save(event);
    }

    async updateEvent(id: string, updateEventDTO: UpdateEventDTO, user: User): Promise <Event> {
        const event = await this.eventRepo.findOne({ where: { id }, relations: ["author"] });
        if (!event) {
            throw new ForbiddenException("Evenement introuvable");
        }

        if (event.author.id !== user.id && user.role !== Role.ADMIN && user.role !== Role.MODERATOR) {
            throw new ForbiddenException("Vous n'êtes pas autorisé à modifier cet événement");
        }

        if (updateEventDTO.maxNumberOfParticipants === null || updateEventDTO.maxNumberOfParticipants === undefined) {
            event.maxNumberOfParticipants = null;
        } else {
            event.maxNumberOfParticipants = updateEventDTO.maxNumberOfParticipants;
        }

        const updated = this.eventRepo.merge(event, updateEventDTO);
        return this.eventRepo.save(updated);
    }

    async removeEvent(id: string, user: User): Promise<void> {
        const event = await this.eventRepo.findOne({ where: { id }, relations: ["author"] });
        if (!event) {
            throw new ForbiddenException("Evénement introuvable");
        }

        if (event.author.id !== user.id && user.role !== Role.ADMIN && user.role !== Role.MODERATOR) {
            throw new ForbiddenException("Vous n'êtes pas autorisé à supprimer cet événement");
        }

        await this.eventRepo.delete(id);
    }

    async removeParticipant(eventId: string, userIdToRemove: string, user: User): Promise<Event> {
        const event = await this.eventRepo.findOne({
            where: { id: eventId },
            relations: ["participantsList", "author"]
        });

        if (!event) {
            throw new NotFoundException("Event not found.");
        }

        if (event.author.id !== user.id && user.role !== Role.ADMIN && user.role !== Role.MODERATOR) {
            throw new ForbiddenException("You are not allowed to edit the participant list.");
        }

        event.participantsList = event.participantsList?.filter((user) => user.id !== userIdToRemove);
        return this.eventRepo.save(event);
    }

    async subscribe(id: string, user: User): Promise<Event> {
        const event = await this.eventRepo.findOne({
            where: { id },
            relations: ["participantsList", "author"],
        });

        if (!event) {
            throw new NotFoundException("Event not found.");
        }

        if (event.participantsList?.some((u) => u.id === user.id)) {
            throw new BadRequestException("You are already registered for this event.")
        }

        if (event.author.id === user.id) {
            throw new BadRequestException("L'auteur ne peut pas s'inscrire à son propre événement.");
        }

    if (
        event.maxNumberOfParticipants !== undefined &&
        event.maxNumberOfParticipants !== null &&
        (event.participantsList ?? []).length >= event.maxNumberOfParticipants
    ) {
        throw new BadRequestException("The event is full.")
    }

        event.participantsList?.push(user);
        return this.eventRepo.save(event);
    }

    async unsubscribe(id: string, user: User): Promise<Event> {
        const event = await this.eventRepo.findOne({
            where: { id },
            relations: ["participantsList", "author"],
        });

        if (!event) {
            throw new NotFoundException("Event not found.");
        }

        const index = (event.participantsList ?? []).findIndex((u) => u.id === user.id);
        if (index === -1) {
            throw new BadRequestException("You are not registered for this event.");
        }

        (event.participantsList ?? []).splice(index, 1);
        return this.eventRepo.save(event);
    }

    @Cron(CronExpression.EVERY_HOUR)
    async cleanEventsOfFormersUsers() {
        const events = await this.eventRepo.find({ relations: ["author"] });
        for (const event of events) {
            if (!event.author) {
                continue;
            }

            if (event.irisCode && event.author.irisCode && event.irisCode !== event.author.irisCode) {
                await this.eventRepo.delete(event.id);
            }
        }
    }
}
