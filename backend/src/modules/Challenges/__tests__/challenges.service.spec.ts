import { Test, TestingModule } from "@nestjs/testing";
import { ChallengesService } from "../challenges.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository, MoreThan } from "typeorm";
import { Challenge } from "../entities/challenge.entity";
import { ChallengeRegistration } from "../entities/challenge-registration.entity";
import { ChallengeCompletion } from "../entities/challenge-completion.entity";
import { User, Role } from "../../Users/entities/user.entity";

describe("ChallengesService", () => {
    let service: ChallengesService;
    let challengeRepo: jest.Mocked<Repository<Challenge>>;
    let registrationRepo: jest.Mocked<Repository<ChallengeRegistration>>;
    let completionRepo: jest.Mocked<Repository<ChallengeCompletion>>;
    let userRepo: jest.Mocked<Repository<User>>;

    beforeEach(async () => {
        challengeRepo = {
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            merge: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
        } as any;
        registrationRepo = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
        } as any;
        completionRepo = {
            createQueryBuilder: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
        } as any;
        userRepo = {
            save: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChallengesService,
                { provide: getRepositoryToken(Challenge), useValue: challengeRepo },
                { provide: getRepositoryToken(ChallengeRegistration), useValue: registrationRepo },
                { provide: getRepositoryToken(ChallengeCompletion), useValue: completionRepo },
                { provide: getRepositoryToken(User), useValue: userRepo },
            ],
        }).compile();

        service = module.get(ChallengesService);
    });

    it("findPendingChallenges as USER filtre irisCode et all", async () => {
        const user = { role: Role.USER, irisCode: "IC" } as any;
        const data = [{ id: "c1" }] as any[];
        challengeRepo.findAndCount.mockResolvedValue([data, 1]);

        const res = await service.findPendingChallenges(2, 3, user);
        expect(challengeRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
            where: [
                { status: "PENDING", irisCode: "IC" },
                { status: "PENDING", irisCode: "all" },
            ],
            skip: 3,
            take: 3,
        }));
        expect(res).toEqual({ data, total: 1, page: 2, lastPage: 1 });
    });

    it("findPendingChallenges as ADMIN ne filtre pas irisCode", async () => {
        const admin = { role: Role.ADMIN } as any;
        challengeRepo.findAndCount.mockResolvedValue([[], 0]);

        const res = await service.findPendingChallenges(undefined, undefined, admin);
        expect(challengeRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
            where: { status: "PENDING" },
            skip: 0,
            take: 5,
        }));
        expect(res.page).toBe(1);
    });

    it("findAllChallenges as USER filtre endDate et irisCode", async () => {
        const user = { role: Role.USER, irisCode: "IC" } as any;
        const data = [{ id: "c2" }] as any[];
        challengeRepo.findAndCount.mockResolvedValue([data, 2]);

        const res = await service.findAllChallenges(1, 2, user);
        expect(challengeRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
            where: [
                { status: "APPROVED", endDate: MoreThan(expect.any(Date)), irisCode: "IC" },
                { status: "APPROVED", endDate: MoreThan(expect.any(Date)), irisCode: "all" },
            ],
            skip: 0,
            take: 2,
        }));
        expect(res.total).toBe(2);
    });

    it("findAllChallenges as ADMIN utilise les defaults", async () => {
        const admin = { role: Role.ADMIN } as any;
        challengeRepo.findAndCount.mockResolvedValue([[], 0]);

        const res = await service.findAllChallenges(1, 10, admin);
        expect(challengeRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
            where: { status: "APPROVED", endDate: MoreThan(expect.any(Date)) },
            skip: 0,
            take: 10,
        }));
        expect(res.total).toBe(0);
    });

    it("findOneChallenge retourne l'entité ou NotFound", async () => {
        const ent = { id: "1" } as any;
        challengeRepo.findOne.mockResolvedValue(ent);
        await expect(service.findOneChallenge("1")).resolves.toBe(ent);

        challengeRepo.findOne.mockResolvedValue(null);
        await expect(service.findOneChallenge("x")).rejects.toThrow("Challenge not found.");
    });

    it("findPendingCompletions filtre query builder", async () => {
        const qb: any = {
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockResolvedValue([["c"], 1]),
        };
        completionRepo.createQueryBuilder.mockReturnValue(qb);

        const user = { role: Role.USER, irisCode: "IC" } as any;
        const res = await service.findPendingCompletions(2, 4, user);

        expect(completionRepo.createQueryBuilder).toHaveBeenCalledWith("completion");
        expect(qb.andWhere).toHaveBeenCalled();
        expect(res).toEqual({ data: ["c"], total: 1, page: 2, lastPage: 1 });
    });

    it("createChallenge met irisCode/all pour admin", async () => {
        const dto = { title: "t", description: "d", startDate: "2025-01-01", endDate: "2025-02-02", successCriteria: "s" } as any;
        const admin = { id: "a", irisCode: "X", irisName: "Y", role: Role.ADMIN } as any;
        const ent = { id: "z", ...dto, irisCode: "all", irisName: "all", author: admin } as any;
        challengeRepo.create.mockReturnValue(ent);
        challengeRepo.save.mockResolvedValue(ent);

        const res = await service.createChallenge(dto, admin);
        expect(challengeRepo.create).toHaveBeenCalledWith(expect.objectContaining({
            irisCode: "all", irisName: "all"
        }));
        expect(res).toBe(ent);
    });

    it("createChallenge throw si author manquant", async () => {
        await expect(service.createChallenge({} as any, null as any)).rejects.toThrow();
    });

    it("updateChallenge happy path et forbidden/not found", async () => {
        const dto = { title: "new" } as any;
        const user = { id: "u1", role: Role.USER } as any;
        const orig = { id: "c", author: { id: "u1" } } as any;
        const merged = { ...orig, title: "new" } as any;

        challengeRepo.findOne.mockResolvedValue(orig);
        challengeRepo.merge.mockReturnValue(merged);
        challengeRepo.save.mockResolvedValue(merged);
        await expect(service.updateChallenge("c", dto, user)).resolves.toBe(merged);
        expect(challengeRepo.merge).toHaveBeenCalledWith(orig, dto);

        challengeRepo.findOne.mockResolvedValue(null);
        await expect(service.updateChallenge("x", {} as any, user)).rejects.toThrow("Challenge not found.");

        challengeRepo.findOne.mockResolvedValue({ id: "c", author: { id: "other" } } as any);
        await expect(service.updateChallenge("c", {} as any, user)).rejects.toThrow("You are not allowed to edit");
    });

    it("removeChallenge happy path et errors", async () => {
        const user = { id: "u1", role: Role.USER } as any;
        challengeRepo.findOne.mockResolvedValue({ id: "c", author: { id: "u1" } } as any);
        await expect(service.removeChallenge("c", user)).resolves.toBeUndefined();
        expect(challengeRepo.delete).toHaveBeenCalledWith("c");

        challengeRepo.findOne.mockResolvedValue(null);
        await expect(service.removeChallenge("x", user)).rejects.toThrow("Challenge not found.");

        challengeRepo.findOne.mockResolvedValue({ id: "c", author: { id: "other" } } as any);
        await expect(service.removeChallenge("c", user)).rejects.toThrow("You are not allowed to delete");
    });

    it("subscribe happy path & erreurs", async () => {
        const user = { id: "u1" } as any;
        const ch = { id: "c", registrations: [], completions: [], author: { id: "a" } } as any;

        challengeRepo.findOne.mockResolvedValue(ch);
        registrationRepo.create.mockReturnValue({} as any);
        registrationRepo.save.mockResolvedValue({} as any);
        await expect(service.subscribe("c", user)).resolves.toBe(ch);

        challengeRepo.findOne.mockResolvedValue(null);
        await expect(service.subscribe("x", user)).rejects.toThrow("Challenge not found.");

        challengeRepo.findOne.mockResolvedValue({ ...ch, registrations: [{ user }] });
        await expect(service.subscribe("c", user)).rejects.toThrow("Already registered");
    });

    it("unsubscribe happy path & error", async () => {
        const user = { id: "u1" } as any;
        registrationRepo.findOne.mockResolvedValue({ id: "r1" } as any);
        registrationRepo.delete.mockResolvedValue({} as any);
        challengeRepo.findOne.mockResolvedValue({ id: "c1" } as any);
        const res = await service.unsubscribe("c1", user);
        expect(registrationRepo.delete).toHaveBeenCalled();
        expect(res.id).toBe("c1");

        registrationRepo.findOne.mockResolvedValue(null);
        await expect(service.unsubscribe("c1", user)).rejects.toThrow("Registration not found");
    });


    it("submitCompletion happy path & errors", async () => {
        const user = { id: "u1" } as any;
        const ch = { id: "c1", registrations: [{ user }] } as any;

        challengeRepo.findOne.mockResolvedValue(ch);
        completionRepo.create.mockReturnValue({ text: "t", imageUrl: "u" } as any);
        completionRepo.save.mockResolvedValue({ text: "t", imageUrl: "u" } as any);
        const ok = await service.submitCompletion("c1", { text: "t", imageUrl: "u" } as any, user);
        expect(ok.imageUrl).toBe("u");

        challengeRepo.findOne.mockResolvedValue(null);
        await expect(service.submitCompletion("x", {} as any, user)).rejects.toThrow("Challenge not found.");

        challengeRepo.findOne.mockResolvedValue({ id: "c1", registrations: [] } as any);
        await expect(service.submitCompletion("c1", {} as any, user)).rejects.toThrow("You must register first.");
    });

    it("validateCompletion approve/reject + erreurs", async () => {
        const user = { id: "a", role: Role.ADMIN, points: 0 } as any;
        const ch = { id: "c", author: { id: "a" } } as any;
        const sub = { id: "s", user: { id: "u1", points: 5 }, challenge: ch } as any;

        challengeRepo.findOne.mockResolvedValue(ch);
        completionRepo.findOne.mockResolvedValue(sub);
        userRepo.save.mockResolvedValue({} as any);
        completionRepo.save.mockResolvedValue({ validated: true, rejectedReason: null } as any);
        const r1 = await service.validateCompletion("c", "s", { validated: true } as any, user);
        expect(r1.validated).toBe(true);

        completionRepo.save.mockResolvedValue({ validated: false, rejectedReason: "R" } as any);
        const r2 = await service.validateCompletion("c", "s", { validated: false, rejectedReason: "R" } as any, user);
        expect(r2.rejectedReason).toBe("R");

        challengeRepo.findOne.mockResolvedValue(null);
        await expect(service.validateCompletion("x","s", {} as any, user)).rejects.toThrow("Challenge not found.");
        challengeRepo.findOne.mockResolvedValue(ch);
        await expect(service.validateCompletion("c","s", {} as any, { id: "u", role: Role.USER } as any))
            .rejects.toThrow("You are not allowed to validate");
        completionRepo.findOne.mockResolvedValue(null);
        await expect(service.validateCompletion("c","x", { validated: false } as any, user))
            .rejects.toThrow("Completion not found.");
    });

    it("validateChallenge approve/reject + erreurs", async () => {
        const user = { id: "a", role: Role.ADMIN, points: 0 } as any;
        const ch = { id: "c", author: { id: "a", points: 1 } } as any;

        challengeRepo.findOne.mockResolvedValue(ch);
        userRepo.save.mockResolvedValue({} as any);
        challengeRepo.save.mockResolvedValue({ status: "APPROVED" } as any);
        const v1 = await service.validateChallenge("c", { validated: true } as any, user);
        expect(v1.status).toBe("APPROVED");

        challengeRepo.findOne.mockResolvedValue(ch);
        challengeRepo.save.mockResolvedValue({ status: "REJECTED", rejectedReason: "no" } as any);
        const v2 = await service.validateChallenge("c", { validated: false, rejectedReason: "no" } as any, user);
        expect(v2.status).toBe("REJECTED");

        challengeRepo.findOne.mockResolvedValue(null);
        await expect(service.validateChallenge("x", {} as any, user)).rejects.toThrow("Challenge not found.");
        challengeRepo.findOne.mockResolvedValue(ch);
        await expect(service.validateChallenge("c", {} as any, { id: "u", role: Role.USER } as any))
            .rejects.toThrow("You are not allow to validate");
    });

    it("cleanChallengesOfFormersUsers supprime que les mismatches", async () => {
        const list = [
            { id: "1", author: null, irisCode: "IC" },
            { id: "2", author: { irisCode: "IC" }, irisCode: "all" },
            { id: "3", author: { irisCode: "X" }, irisCode: "Y" },
        ] as any[];
        challengeRepo.find.mockResolvedValue(list);
        challengeRepo.delete.mockResolvedValue({} as any);

        await service.cleanChallengesOfFormersUsers();
        expect(challengeRepo.delete).toHaveBeenCalledWith("3");
    });
});
