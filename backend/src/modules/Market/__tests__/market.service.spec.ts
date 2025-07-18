import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere } from "typeorm";
import { MarketService } from "../market.service";
import { MarketItem } from "../entities/market.entity";
import { User, Role } from "../../Users/entities/user.entity";

describe("MarketService", () => {
    let service: MarketService;
    let repo: jest.Mocked<Repository<MarketItem>>;

    beforeEach(async () => {
        repo = {
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
            merge: jest.fn(),
        } as any;
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MarketService,
                { provide: getRepositoryToken(MarketItem), useValue: repo },
            ],
        }).compile();
        service = module.get<MarketService>(MarketService);
        jest.clearAllMocks();
    });

    describe("findAllItems", () => {
        it("admin without filter", async () => {
            const items = [{ id: "i1" }] as any[];
            repo.findAndCount.mockResolvedValue([items, 1] as any);
            const res = await service.findAllItems(2, 5, { role: Role.ADMIN } as any);
            expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
                where: {},
                skip: 5,
                take: 5,
            }));
            expect(res).toEqual({ data: items, total: 1, page: 2, lastPage: 1 });
        });
        it("user with iris filter", async () => {
            repo.findAndCount.mockResolvedValue([[{ id: "i2" }], 0] as any);
            const res = await service.findAllItems(1, 10, { role: Role.USER, irisCode: "IC" } as any);
            expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.arrayContaining([
                    { irisCode: "IC" },
                    { irisCode: "all" },
                ]),
            }));
            expect(res.page).toBe(1);
        });
    });

    describe("findOneItem", () => {
        it("returns when found", async () => {
            const mi = { id: "x" } as any;
            repo.findOne.mockResolvedValue(mi);
            await expect(service.findOneItem("x")).resolves.toBe(mi);
        });
        it("throws when not found", async () => {
            repo.findOne.mockResolvedValue(null);
            await expect(service.findOneItem("x")).rejects.toThrow("Item not found.");
        });
    });

    describe("createItem", () => {
        it("admin sets iris all", async () => {
            const admin = { id: "u", role: Role.ADMIN, irisCode: "A", irisName: "N" } as any;
            const created = { id: "c" } as any;
            repo.create.mockReturnValue(created);
            repo.save.mockResolvedValue(created);
            const res = await service.createItem({ title: "t", description: "d", images: [], price: 1 } as any, admin);
            expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({
                irisCode: "all",
                irisName: "all",
                author: admin,
            }));
            expect(res).toBe(created);
        });
        it("user keeps own iris", async () => {
            const user = { id: "u1", role: Role.USER, irisCode: "IC", irisName: "IN" } as any;
            repo.create.mockReturnValue({ id: "c2" } as any);
            repo.save.mockResolvedValue({ id: "c2" } as any);
            await service.createItem({ title: "t", description: "d" } as any, user);
            expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({
                irisCode: "IC",
                irisName: "IN",
            }));
        });
    });

    describe("updateItem", () => {
        it("success", async () => {
            const user = { id: "u1", role: Role.USER } as any;
            const orig = { id: "i", author: user } as any;
            const merged = { ...orig, title: "new" } as any;
            repo.findOne.mockResolvedValue(orig);
            repo.merge.mockReturnValue(merged);      // now works
            repo.save.mockResolvedValue(merged);
            const res = await service.updateItem("i", { title: "new" } as any, user);
            expect(repo.merge).toHaveBeenCalledWith(orig, { title: "new" });
            expect(res).toBe(merged);
        });
        it("not found or forbidden", async () => {
            await expect(service.updateItem("x", {} as any, {} as any))
                .rejects.toThrow("Item not found.");
            repo.findOne.mockResolvedValue({ id: "i", author: { id: "a" } } as any);
            await expect(service.updateItem("i", {} as any, { id: "u", role: Role.USER } as any))
                .rejects.toThrow("You are not allowed to edit this item.");
        });
    });

    describe("removeItem", () => {
        it("success", async () => {
            const user = { id: "u1", role: Role.USER } as any;
            repo.findOne.mockResolvedValue({ id: "i", author: user } as any);
            await expect(service.removeItem("i", user)).resolves.toBeUndefined();
            expect(repo.delete).toHaveBeenCalledWith("i");
        });
        it("not found or forbidden", async () => {
            const user = { id: "u1", role: Role.USER } as any;
            repo.findOne.mockResolvedValue(null);
            await expect(service.removeItem("x", user)).rejects.toThrow("Item not found.");
            repo.findOne.mockResolvedValue({ id: "i", author: { id: "a" } } as any);
            await expect(service.removeItem("i", user)).rejects.toThrow("You are not allowed to delete this item.");
        });
    });

    describe("cleanItemsMarketOfFormersUsers", () => {
        it("only mismatches are deleted", async () => {
            const list = [
                { id: "1", author: null, irisCode: "IC" },
                { id: "2", author: { irisCode: "IC" }, irisCode: "all" },
                { id: "3", author: { irisCode: "X" }, irisCode: "Y" },
            ] as any[];
            repo.find.mockResolvedValue(list);
            await service.cleanItemsMarketOfFormersUsers();
            expect(repo.delete).toHaveBeenCalledWith("3");
        });
    });
});
