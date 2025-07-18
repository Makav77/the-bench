import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository, MoreThan } from "typeorm";
import { EventService } from "../event.service";
import { Event } from "../entities/event.entity";
import { CreateEventDTO } from "../dto/create-event.dto";
import { UpdateEventDTO } from "../dto/update-event.dto";
import { User, Role } from "../../Users/entities/user.entity";
import { NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";

describe("EventService", () => {
    let service: EventService;
    let repo: jest.Mocked<Repository<Event>>;

    beforeEach(async () => {
        repo = {
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            merge: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EventService,
                { provide: getRepositoryToken(Event), useValue: repo },
            ],
        }).compile();

        service = module.get(EventService);
    });

    describe("findAllEvents", () => {
        it("pour USER applique irisCode", async () => {
            const user = { role: Role.USER, irisCode: "IC" } as User;
            const data = [{ id: "e1" }] as any[];
            repo.findAndCount.mockResolvedValue([data, 1]);
            const res = await service.findAllEvents(2, 3, user);
            expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
                where: [
                    { endDate: MoreThan(expect.any(Date)), irisCode: "IC" },
                    { endDate: MoreThan(expect.any(Date)), irisCode: "all" },
                ],
                skip: 3,
                take: 3,
            }));
            expect(res).toEqual({ data, total: 1, page: 2, lastPage: 1 });
        });

        it("pour ADMIN n'applique pas irisCode", async () => {
            const admin = { role: Role.ADMIN } as User;
            repo.findAndCount.mockResolvedValue([[], 0]);
            const res = await service.findAllEvents(undefined, undefined, admin);
            expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
                where: { endDate: MoreThan(expect.any(Date)) },
                skip: 0,
                take: 5,
            }));
            expect(res.page).toBe(1);
        });
    });

    describe("findOneEvent", () => {
        it("retourne l'événement existant", async () => {
            const ev = { id: "e1" } as Event;
            repo.findOne.mockResolvedValue(ev);
            await expect(service.findOneEvent("e1")).resolves.toBe(ev);
        });

        it("throw NotFoundException si introuvable", async () => {
            repo.findOne.mockResolvedValue(null);
            await expect(service.findOneEvent("x")).rejects.toThrow(NotFoundException);
        });
    });

    describe("createEvent", () => {
        it("set irisCode ALL pour ADMIN", async () => {
            const dto: CreateEventDTO = {
                name: "N", startDate: "2025-01-01", endDate: "2025-02-02",
                place: "P", description: "D",
            };
            const admin = { id: "u1", irisCode: "X", irisName: "Y", role: Role.ADMIN } as User;
            const ent = { id: "e1", ...dto, irisCode: "all", irisName: "all", author: admin, participantsList: [] } as any;
            repo.create.mockReturnValue(ent);
            repo.save.mockResolvedValue(ent);
            const res = await service.createEvent(dto, admin);
            expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({
                irisCode: "all", irisName: "all", author: admin, participantsList: []
            }));
            expect(res).toBe(ent);
        });

        it("set irisCode normal pour USER", async () => {
            const dto: CreateEventDTO = {
                name: "X", startDate: "2025-03-03", endDate: "2025-04-04",
                place: "L", description: "Desc",
            };
            const user = { id: "u2", irisCode: "IC", irisName: "IN", role: Role.USER } as User;
            const ent = { id: "e2", ...dto, irisCode: "IC", irisName: "IN", author: user, participantsList: [] } as any;
            repo.create.mockReturnValue(ent);
            repo.save.mockResolvedValue(ent);
            const res = await service.createEvent(dto, user);
            expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({
                irisCode: "IC", irisName: "IN", author: user
            }));
            expect(res).toBe(ent);
        });
    });

    describe("updateEvent", () => {
        it("modifie maxNumber et merge", async () => {
            const orig = { id: "e", author: { id: "u1" }, maxNumberOfParticipants: 10 } as any;
            const dto: UpdateEventDTO = { maxNumberOfParticipants: 5 };
            repo.findOne.mockResolvedValue(orig);
            repo.merge.mockReturnValue(orig);
            repo.save.mockResolvedValue(orig);
            const res = await service.updateEvent("e", dto, { id: "u1", role: Role.USER } as User);
            expect(repo.merge).toHaveBeenCalledWith(orig, dto);
            expect(res).toBe(orig);
        });

        it("throw NotFound si pas trouvé", async () => {
            repo.findOne.mockResolvedValue(null);
            await expect(service.updateEvent("x", {}, { id: "u" } as any)).rejects.toThrow(NotFoundException);
        });

        it("throw Forbidden si pas author/admin/mod", async () => {
            const orig = { id: "e", author: { id: "u2" } } as any;
            repo.findOne.mockResolvedValue(orig);
            await expect(service.updateEvent("e", {}, { id: "u1", role: Role.USER } as any)).rejects.toThrow(ForbiddenException);
        });
    });

    describe("removeEvent", () => {
        it("supprime si author/admin", async () => {
            const ev = { id: "e", author: { id: "u1" } } as any;
            repo.findOne.mockResolvedValue(ev);
            await expect(service.removeEvent("e", { id: "u1", role: Role.USER } as any)).resolves.toBeUndefined();
            expect(repo.delete).toHaveBeenCalledWith("e");
        });

        it("throw NotFound si pas trouvé", async () => {
            repo.findOne.mockResolvedValue(null);
            await expect(service.removeEvent("x", {} as any)).rejects.toThrow(NotFoundException);
        });

        it("throw Forbidden sinon", async () => {
            const ev = { id: "e", author: { id: "u2" } } as any;
            repo.findOne.mockResolvedValue(ev);
            await expect(service.removeEvent("e", { id: "u1", role: Role.USER } as any)).rejects.toThrow(ForbiddenException);
        });
    });

    describe("subscribe/unsubscribe", () => {
        it("subscribe happy path", async () => {
            const ev = { id: "e", participantsList: [], author: { id: "a" } } as any;
            repo.findOne.mockResolvedValue(ev);
            repo.save.mockResolvedValue({ ...ev, participantsList: [{ id: "u" }] });
            const res = await service.subscribe("e", { id: "u", role: Role.USER } as User);
            expect(res.participantsList).toHaveLength(1);
        });

        it("subscribe errors", async () => {
            await expect(service.subscribe("x", { id: "u" } as any)).rejects.toThrow(NotFoundException);
            const full = { id: "e", participantsList: [{ id: "u" }], author: { id: "a" }, maxNumberOfParticipants: 1 } as any;
            repo.findOne.mockResolvedValue(full);
            await expect(service.subscribe("e", { id: "u", role: Role.USER } as any)).rejects.toThrow(BadRequestException);
        });

        it("unsubscribe happy", async () => {
            const ev = { id: "e", participantsList: [{ id: "u" }], author: { id: "a" } } as any;
            repo.findOne.mockResolvedValue(ev);
            repo.save.mockResolvedValue({ ...ev, participantsList: [] });
            const res = await service.unsubscribe("e", { id: "u", role: Role.USER } as User);
            expect(res.participantsList).toHaveLength(0);
        });

        it("unsubscribe error", async () => {
            const ev = { id: "e", participantsList: [], author: { id: "a" } } as any;
            repo.findOne.mockResolvedValue(ev);
            await expect(service.unsubscribe("e", { id: "u" } as any)).rejects.toThrow(BadRequestException);
        });
    });

    describe("removeParticipant", () => {
        it("retire un participant", async () => {
            const ev = { id: "e", participantsList: [{ id: "u1" }, { id: "u2" }], author: { id: "a" } } as any;
            repo.findOne.mockResolvedValue(ev);
            repo.save.mockResolvedValue({ ...ev, participantsList: [{ id: "u2" }] });
            const res = await service.removeParticipant("e", "u1", { id: "a", role: Role.USER } as any);
            expect(res.participantsList).toEqual([{ id: "u2" }]);
        });
        it("errors", async () => {
            repo.findOne.mockResolvedValue(null);
            await expect(service.removeParticipant("x", "u", { id: "a" } as any)).rejects.toThrow(NotFoundException);
            const ev = { id: "e", participantsList: [], author: { id: "a" } } as any;
            repo.findOne.mockResolvedValue(ev);
            await expect(service.removeParticipant("e", "u", { id: "u2", role: Role.USER } as any)).rejects.toThrow(ForbiddenException);
        });
    });

    describe("cleanEventsOfFormersUsers", () => {
        it("supprime les events mismatch iris", async () => {
            const list = [
                { id: "1", author: null, irisCode: "X" },
                { id: "2", author: { irisCode: "IC" }, irisCode: "all" },
                { id: "3", author: { irisCode: "X" }, irisCode: "Y" },
            ] as any[];
            repo.find.mockResolvedValue(list);
            repo.delete.mockResolvedValue({} as any);
            await service.cleanEventsOfFormersUsers();
            expect(repo.delete).toHaveBeenCalledWith("3");
        });
    });
});
