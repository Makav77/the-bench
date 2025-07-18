import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { LessThan, MoreThan } from "typeorm";
import { subHours } from "date-fns";
import { FlashPostsService } from "../flashposts.service";
import { FlashPost } from "../entities/flash-post.entity";
import { Repository } from "typeorm";
import { User, Role } from "../../Users/entities/user.entity";

describe("FlashPostsService", () => {
    let service: FlashPostsService;
    let flashRepo: jest.Mocked<Repository<FlashPost>>;

    beforeEach(async () => {
        flashRepo = {
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            merge: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FlashPostsService,
                { provide: getRepositoryToken(FlashPost), useValue: flashRepo },
            ],
        }).compile();

        service = module.get<FlashPostsService>(FlashPostsService);
    });

    it("findAllFlashPosts pour user IPTV", async () => {
        const user = { id: "u1", role: Role.USER, irisCode: "IC" } as any;
        const recent = subHours(new Date(), 24);
        const data = [{ id: "f1" }] as any[];
        flashRepo.findAndCount.mockResolvedValue([data, 5]);

        const res = await service.findAllFlashPosts(2, 3, user);

        expect(flashRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.arrayContaining([
                { createdAt: MoreThan(expect.any(Date)), irisCode: "IC" },
                { createdAt: MoreThan(expect.any(Date)), irisCode: "all" },
            ]),
            skip: 3,
            take: 3,
        }));
        expect(res).toEqual({ data, total: 5, page: 2, lastPage: 2 });
    });

    it("findAllFlashPosts pour admin utilise irisCode 'all'", async () => {
        const admin = { id: "a", role: Role.ADMIN } as any;
        flashRepo.findAndCount.mockResolvedValue([[], 0]);
        const res = await service.findAllFlashPosts(undefined, undefined, admin);
        expect(flashRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
            where: { createdAt: MoreThan(expect.any(Date)) },
            skip: 0,
            take: 5,
        }));
        expect(res.page).toBe(1);
    });

    it("findOneFlashPost success et throw", async () => {
        const ent = { id: "x" } as any;
        flashRepo.findOne.mockResolvedValue(ent);
        await expect(service.findOneFlashPost("x")).resolves.toBe(ent);

        flashRepo.findOne.mockResolvedValue(null);
        await expect(service.findOneFlashPost("y"))
            .rejects.toThrow("FlashPost not found.");
    });

    it("createFlashPost happy et erreur si actif existant", async () => {
        const dto = { title: "T", description: "D" } as any;
        const user = { id: "u1", role: Role.USER, irisCode: "IC", irisName: "IN" } as any;
        // pas de post actif -> count = 0
        flashRepo.count.mockResolvedValue(0);
        const created = { id: "f2", ...dto, irisCode: "IC", irisName: "IN", author: user } as any;
        flashRepo.create.mockReturnValue(created);
        flashRepo.save.mockResolvedValue(created);

        const res = await service.createFlashPost(dto, user);
        expect(flashRepo.count).toHaveBeenCalledWith(expect.objectContaining({
            where: {
                author: { id: "u1" },
                createdAt: MoreThan(expect.any(Date)),
            }
        }));
        expect(flashRepo.save).toHaveBeenCalledWith(created);
        expect(res).toBe(created);

        // post actif existant -> count > 0
        flashRepo.count.mockResolvedValue(1);
        await expect(service.createFlashPost(dto, user))
            .rejects.toThrow("You already have an active flash post.");
    });

    it("updateFlashPost happy et forbidden/not found", async () => {
        const dto = { description: "New" } as any;
        const user = { id: "u1", role: Role.USER } as any;
        const orig = { id: "i1", author: { id: "u1" } } as any;
        const merged = { ...orig, ...dto } as any;

        flashRepo.findOne.mockResolvedValue(orig);
        flashRepo.merge.mockReturnValue(merged);
        flashRepo.save.mockResolvedValue(merged);

        const res = await service.updateFlashPost("i1", dto, user);
        expect(flashRepo.merge).toHaveBeenCalledWith(orig, dto);
        expect(res).toBe(merged);

        flashRepo.findOne.mockResolvedValue(null);
        await expect(service.updateFlashPost("x", {}, user))
            .rejects.toThrow("FlashPost not found.");

        flashRepo.findOne.mockResolvedValue({ id: "i1", author: { id: "u2" } } as any);
        await expect(service.updateFlashPost("i1", {}, user))
            .rejects.toThrow("You are not allowed to edit this flash post.");
    });

    it("removeFlashPost happy et forbidden/not found", async () => {
        const user = { id: "u1", role: Role.USER } as any;
        flashRepo.findOne.mockResolvedValue({ id: "r1", author: { id: "u1" } } as any);
        await expect(service.removeFlashPost("r1", user)).resolves.toBeUndefined();
        expect(flashRepo.delete).toHaveBeenCalledWith("r1");

        flashRepo.findOne.mockResolvedValue(null);
        await expect(service.removeFlashPost("x", user))
            .rejects.toThrow("FlashPost not found.");

        flashRepo.findOne.mockResolvedValue({ id: "r1", author: { id: "u2" } } as any);
        await expect(service.removeFlashPost("r1", user))
            .rejects.toThrow("You are not allowed to delete this flash post.");
    });

    it("purgeExpired supprime bien les anciens", async () => {
        const limite = subHours(new Date(), 24);
        flashRepo.delete.mockResolvedValue({} as any);
        await service.purgeExpired();
        expect(flashRepo.delete).toHaveBeenCalledWith({ createdAt: LessThan(expect.any(Date)) });
    });

    it("cleanFlashPostsOfFormersUsers ne supprime que mismatch", async () => {
        const list = [
            { id: "1", author: null, irisCode: "IC" },
            { id: "2", author: { irisCode: "IC" }, irisCode: "all" },
            { id: "3", author: { irisCode: "X" }, irisCode: "Y" },
        ] as any[];
        flashRepo.find.mockResolvedValue(list);
        flashRepo.delete.mockResolvedValue({} as any);

        await service.cleanFlashPostsOfFormersUsers();
        expect(flashRepo.delete).toHaveBeenCalledWith("3");
    });
});
