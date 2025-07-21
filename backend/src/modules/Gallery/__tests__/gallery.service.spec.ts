import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { join } from "path";
import { Repository, MoreThan } from "typeorm";
import { GalleryService } from "../gallery.service";
import { GalleryItem } from "../entities/gallery-item.entity";
import { User, Role } from "../../Users/entities/user.entity";
import { unlink } from "fs/promises";

jest.mock("fs/promises", () => ({
    unlink: jest.fn().mockResolvedValue(undefined),
}));

describe("GalleryService", () => {
    let service: GalleryService;
    let repo: jest.Mocked<Repository<GalleryItem>>;

    beforeEach(async () => {
        repo = {
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GalleryService,
                { provide: getRepositoryToken(GalleryItem), useValue: repo },
            ],
        }).compile();

        service = module.get<GalleryService>(GalleryService);
        jest.clearAllMocks();
    });

    describe("findAllGalleryItems", () => {
        it("admin without filter", async () => {
            const items: GalleryItem[] = [{
                id: "i1",
                url: "u",
                irisCode: "all",
                irisName: "all",
                description: undefined,
                createdAt: new Date(),
                author: {} as any,
                likedBy: [],
            }];
            repo.findAndCount.mockResolvedValue([items, 1] as any);
            const res = await service.findAllGalleryItems(2, 5, { role: Role.ADMIN } as any);
            expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
                where: {},
                skip: 5,
                take: 5,
            }));
            expect(res).toEqual({ data: items, total: 1, page: 2, lastPage: 1 });
        });

        it("user with iris filter", async () => {
            repo.findAndCount.mockResolvedValue([[{ id: "i2", url:"", irisCode:"IC", irisName:"IN", createdAt:new Date(), author:{} as any, likedBy:[] }], 0] as any);
            const res = await service.findAllGalleryItems(1, 10, { role: Role.USER, irisCode: "IC" } as any);
            expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.arrayContaining([
                { irisCode: "IC" },
                { irisCode: "all" },
                ]),
            }));
            expect(res.page).toBe(1);
        });
    });

    describe("findOneGalleryItem", () => {
        it("returns when found", async () => {
            const gi = { id: "x" } as any;
            repo.findOne.mockResolvedValue(gi);
            await expect(service.findOneGalleryItem("x")).resolves.toBe(gi);
            });

        it("throws when not found", async () => {
            repo.findOne.mockResolvedValue(null);
            await expect(service.findOneGalleryItem("x"))
                .rejects.toThrow("Gallery item not found.");
        });
    });

    describe("createGalleryItem", () => {
        it("admin sets irisCode/all", async () => {
            const admin = { id: "u", role: Role.ADMIN, irisCode: "IC", irisName: "IN" } as any;
            const created = { id: "c" } as any;
            repo.create.mockReturnValue(created);
            repo.save.mockResolvedValue(created);
            const res = await service.createGalleryItem("d", "/url.png", admin);
            expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({
                url: "/url.png",
                description: "d",
                irisCode: "all",
                irisName: "all",
                author: admin,
            }));
            expect(res).toBe(created);
        });

        it("user keeps own irisCode", async () => {
            const user = { id: "u1", role: Role.USER, irisCode: "IC", irisName: "IN" } as any;
            const created = { id: "c2" } as any;
            repo.create.mockReturnValue(created);
            repo.save.mockResolvedValue(created);
            const res = await service.createGalleryItem(undefined, "/u2.png", user);
            expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({
                irisCode: "IC",
                irisName: "IN",
                url: "/u2.png",
            }));
            expect(res).toBe(created);
        });
    });

    describe("toggleLike", () => {
        it("adds and removes a like", async () => {
            const user = { id: "u1" } as any;
            const item = { id: "i", likedBy: [] } as any;
            repo.findOne.mockResolvedValue(item);

            repo.save.mockResolvedValue({ ...item, likedBy: ["u1"] } as any);
            let out = await service.toggleLike("i", user);
            expect(out.likedBy).toContain("u1");

            item.likedBy = ["u1"];
            repo.findOne.mockResolvedValue(item);
            repo.save.mockResolvedValue({ ...item, likedBy: [] } as any);
            out = await service.toggleLike("i", user);
            expect(out.likedBy).not.toContain("u1");
        });

        it("throws if missing", async () => {
            repo.findOne.mockResolvedValue(null);
            await expect(service.toggleLike("x", { id: "u" } as any))
                .rejects.toThrow("Gallery item not found.");
        });
    });

    describe("removeGalleryItem", () => {
        const user = { id: "u1", role: Role.USER } as any;

        it("deletes file then record", async () => {
            const gi = { id: "i", author: user, url: "/uploads/gallery/file.png" } as any;
            repo.findOne.mockResolvedValue(gi);
            await service.removeGalleryItem("i", user);
            expect(unlink).toHaveBeenCalledWith(
                join(process.cwd(), "uploads", "gallery", "file.png")
            );
            expect(repo.delete).toHaveBeenCalledWith("i");
        });

        it("throws if not found", async () => {
            repo.findOne.mockResolvedValue(null);
            await expect(service.removeGalleryItem("x", user))
                .rejects.toThrow("Item not found.");
        });

        it("throws if forbidden", async () => {
            repo.findOne.mockResolvedValue({ id: "i", author: { id: "u2" } } as any);
            await expect(service.removeGalleryItem("i", user))
                .rejects.toThrow("You are not allowed to delete this item.");
        });
    });

    describe("cleanItemsGalleryOfFormersUsers", () => {
        it("only mismatches get deleted", async () => {
            const list = [
                { id: "1", author: null, irisCode: "IC" },
                { id: "2", author: { irisCode: "IC" }, irisCode: "all"},
                { id: "3", author: { irisCode: "X" }, irisCode: "Y"},
            ] as any[];
            repo.find.mockResolvedValue(list);
            await service.cleanItemsGalleryOfFormersUsers();
            expect(repo.delete).toHaveBeenCalledWith("3");
            expect(repo.delete).toHaveBeenCalledTimes(1);
        });
    });
});
