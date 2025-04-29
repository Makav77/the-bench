import { Controller, Get, Param, Query, DefaultValuePipe, ParseIntPipe } from "@nestjs/common";
import { EventService } from "./event.service";
import { Event } from "./entities/event.entity";

@Controller("events")
export class EventController {
    constructor(private readonly eventService: EventService) {}

    @Get()
    async findAllEvents(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(5), ParseIntPipe) limit: number
    ): Promise<{ data: Event[]; total: number; page: number; lastPage: number; }> {
        return this.eventService.findAllEvents(page, limit);
    }

    @Get(":id")
    async findOneEvent(@Param("id") id: string): Promise<Event> {
        return this.eventService.findOneEvent(id);
    }
}
