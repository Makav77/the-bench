import { Test, TestingModule } from "@nestjs/testing";
import { EventController } from "../event.controller";
import { EventService } from "../event.service";
import { JwtAuthGuard } from "../../Auth/guards/jwt-auth.guard";
import { IrisGuard } from "../../Auth/guards/iris.guard";
import { PermissionGuard } from "../../Permissions/guards/permission.guard";
import { RequestWithResource } from "../../Utils/request-with-resource.interface";
import { Event } from "../entities/event.entity";

describe("EventController", () => {
    let controller: EventController;
    const svc = {
        findAllEvents: jest.fn(),
        findOneEvent: jest.fn(),
        createEvent: jest.fn(),
        updateEvent: jest.fn(),
        removeEvent: jest.fn(),
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
        removeParticipant: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EventController],
            providers: [{ provide: EventService, useValue: svc }],
        })
            .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
            .overrideGuard(IrisGuard).useValue({ canActivate: () => true })
            .overrideGuard(PermissionGuard).useValue({ canActivate: () => true })
            .compile();

        controller = module.get(EventController);
        jest.clearAllMocks();
    });

    it("GET /events appelle findAllEvents", async () => {
        const page = 2, limit = 4;
        const user = { id: "u1" } as any;
        svc.findAllEvents.mockResolvedValue({ data: [], total: 0, page, lastPage: 0 });
        const res = await controller.findAllEvents(page, limit, { user } as RequestWithResource<Event>);
        expect(svc.findAllEvents).toHaveBeenCalledWith(page, limit, user);
        expect(res.page).toBe(page);
    });

    it("GET /events/:id retourne resource", async () => {
        const ev = { id: "e1" } as any;
        const res = await controller.findOneEvent(ev);
        expect(res).toBe(ev);
    });

    it("POST /events crée un event", async () => {
        const dto = { name: "E", startDate: "2025-05-05", endDate: "2025-06-06", place: "L", description: "D" } as any;
        const user = { id: "u1" } as any;
        const created = { id: "e2", ...dto } as any;
        svc.createEvent.mockResolvedValue(created);
        const res = await controller.createEvent(dto, { user } as RequestWithResource<Event>);
        expect(svc.createEvent).toHaveBeenCalledWith(dto, user);
        expect(res).toBe(created);
    });

    it("PATCH /events/:id updateEvent", async () => {
        const dto = { place: "X" } as any;
        const ev = { id: "e3" } as any;
        const user = { id: "u1" } as any;
        svc.updateEvent.mockResolvedValue(ev);
        const res = await controller.updateEvent(ev, dto, { user } as RequestWithResource<Event>);
        expect(svc.updateEvent).toHaveBeenCalledWith("e3", dto, user);
        expect(res).toBe(ev);
    });

    it("DELETE /events/:id removeEvent", async () => {
        const ev = { id: "e4" } as any;
        const user = { id: "u1" } as any;
        svc.removeEvent.mockResolvedValue(undefined);
        const res = await controller.removeEvent(ev, { user } as RequestWithResource<Event>);
        expect(svc.removeEvent).toHaveBeenCalledWith("e4", user);
        expect(res).toBeUndefined();
    });

    it("POST /events/:id/subscribe", async () => {
        const ev = { id: "e5" } as any;
        const user = { id: "u1" } as any;
        svc.subscribe.mockResolvedValue(ev);
        const res = await controller.subscribe(ev, { user } as RequestWithResource<Event>);
        expect(svc.subscribe).toHaveBeenCalledWith("e5", user);
        expect(res).toBe(ev);
    });

    it("DELETE /events/:id/subscribe", async () => {
        const ev = { id: "e6" } as any;
        const user = { id: "u2" } as any;
        svc.unsubscribe.mockResolvedValue(ev);
        const res = await controller.unsubscribe(ev, { user } as RequestWithResource<Event>);
        expect(svc.unsubscribe).toHaveBeenCalledWith("e6", user);
        expect(res).toBe(ev);
    });

    it("DELETE /events/:id/participants/:userId", async () => {
        const ev = { id: "e7" } as any;
        const user = { id: "u1" } as any;
        svc.removeParticipant.mockResolvedValue(ev);
        const res = await controller.removeParticipant(ev, "u2", { user } as RequestWithResource<Event>);
        expect(svc.removeParticipant).toHaveBeenCalledWith("e7", "u2", user);
        expect(res).toBe(ev);
    });
});
