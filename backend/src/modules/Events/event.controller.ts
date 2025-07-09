import { Controller, Get, Param, Query, DefaultValuePipe, ParseIntPipe, Post, Body, Patch, Delete, Req, UseGuards } from "@nestjs/common";
import { EventService } from "./event.service";
import { Event } from "./entities/event.entity";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";
import { CreateEventDTO } from "./dto/create-event.dto";
import { UpdateEventDTO } from "./dto/update-event.dto";
import { User } from "../Users/entities/user.entity";
import { RequiredPermission } from "../Permissions/decorator/require-permission.decorator";
import { PermissionGuard } from "../Permissions/guards/permission.guard";
import { IrisGuard } from "../Auth/guards/iris.guard";
import { RequestWithResource } from "../Utils/request-with-resource.interface";
import { Resource } from "../Utils/resource.decorator";

@Controller("events")
export class EventController {
    constructor(private readonly eventService: EventService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllEvents(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Req() req: RequestWithResource<Event>
    ): Promise<{ data: Event[]; total: number; page: number; lastPage: number; }> {
        const user = req.user as User;
        return this.eventService.findAllEvents(page, limit, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Get(":id")
    async findOneEvent(@Resource() event: Event): Promise<Event> {
        return event;
    }

    @UseGuards(JwtAuthGuard, PermissionGuard)
    @RequiredPermission("create_event")
    @Post()
    async createEvent(
        @Body() createEventDTO: CreateEventDTO,
        @Req() req: RequestWithResource<Event>
    ): Promise<Event> {
        const user = req.user as User;
        return this.eventService.createEvent(createEventDTO, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Patch(":id")
    async updateEvent(
        @Resource() event: Event,
        @Body() updateEventDTO: UpdateEventDTO,
        @Req() req: RequestWithResource<Event>
    ): Promise<Event> {
        const user = req.user as User;
        return this.eventService.updateEvent(event.id, updateEventDTO, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Delete(":id")
    async removeEvent(
        @Resource() event: Event,
        @Req() req: RequestWithResource<Event>
    ): Promise<void> {
        const user = req.user as User;
        return this.eventService.removeEvent(event.id, user);
    }

    @RequiredPermission("register_event")
    @UseGuards(JwtAuthGuard, IrisGuard, PermissionGuard)
    @Post(":id/subscribe")
    async subscribe(
        @Resource() event: Event,
        @Req() req: RequestWithResource<Event>
    ): Promise<Event> {
        const user = req.user as User;
        return this.eventService.subscribe(event.id, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Delete(":id/subscribe")
    async unsubscribe(
        @Resource() event: Event,
        @Req() req: RequestWithResource<Event>
    ): Promise<Event> {
        const user = req.user as User;
        return this.eventService.unsubscribe(event.id, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Delete(":id/participants/:userId")
    async removeParticipant(
        @Resource() event: Event,
        @Param("userId") userId: string,
        @Req() req: RequestWithResource<Event>
    ): Promise<Event> {
        const user = req.user as User;
        return this.eventService.removeParticipant(event.id, userId, user);
    }
}
