import { Controller, Get, Param, Query, DefaultValuePipe, ParseIntPipe, Post, Body, Patch, Delete, Req, UseGuards } from "@nestjs/common";
import { EventService } from "./event.service";
import { Event } from "./entities/event.entity";
import { Request } from "express";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";
import { CreateEventDTO } from "./dto/create-event.dto";
import { UpdateEventDTO } from "./dto/update-event.dto";
import { User } from "../Users/entities/user.entity";
import { RequiredPermission } from "../Permissions/decorator/require-permission.decorator";

@Controller("events")
export class EventController {
    constructor(private readonly eventService: EventService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllEvents(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(5), ParseIntPipe) limit: number
    ): Promise<{ data: Event[]; total: number; page: number; lastPage: number; }> {
        return this.eventService.findAllEvents(page, limit);
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id")
    async findOneEvent(@Param("id") id: string): Promise<Event> {
        return this.eventService.findOneEvent(id);
    }

    @UseGuards(JwtAuthGuard)
    @RequiredPermission("create_event")
    @Post()
    async createEvent(
        @Body() createEventDTO: CreateEventDTO,
        @Req() req: Request,
    ): Promise<Event> {
        const user = req.user as User;
        return this.eventService.createEvent(createEventDTO, user);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(":id")
    async updateEvent(
        @Param("id") id: string,
        @Body() updateEventDTO: UpdateEventDTO,
        @Req() req: Request,
    ): Promise<Event> {
        const user = req.user as User;
        return this.eventService.updateEvent(id, updateEventDTO, user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async removeEvent(
        @Param("id") id: string,
        @Req() req: Request,
    ): Promise<void> {
        const user = req.user as User;
        return this.eventService.removeEvent(id, user);
    }

    @UseGuards(JwtAuthGuard)
    @RequiredPermission("register_event")
    @Post(":id/subscribe")
    async subscribe(
        @Param("id") id:string,
        @Req() req: Request
    ): Promise<Event> {
        const user = req.user as User;
        return this.eventService.subscribe(id, user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id/subscribe")
    async unsubscribe(
        @Param("id") id:string,
        @Req() req: Request,
    ): Promise<Event> {
        const user = req.user as User;
        return this.eventService.unsubscribe(id, user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id/participants/:userId")
    async removeParticipant(
        @Param("id") eventId: string,
        @Param("userId") userId: string,
        @Req() req: Request,
    ): Promise<Event> {
        const user = req.user as User;
        return this.eventService.removeParticipant(eventId, userId, user);
    }
}
