// backend/src/modules/Market/__tests__/market.controller.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { MarketController } from "../market.controller";
import { MarketService } from "../market.service";
import { JwtAuthGuard } from "../../Auth/guards/jwt-auth.guard";
import { IrisGuard } from "../../Auth/guards/iris.guard";
import { FilesInterceptor } from "@nestjs/platform-express";

describe("MarketController", () => {
    let controller: MarketController;
    const svc = {
        findAllItems: jest.fn(),
        findOneItem: jest.fn(),
        createItem: jest.fn(),
        updateItem: jest.fn(),
        removeItem: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MarketController],
            providers: [{ provide: MarketService, useValue: svc }],
        })
            .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
            .overrideGuard(IrisGuard).useValue({ canActivate: () => true })
            .overrideInterceptor(FilesInterceptor).useValue({ intercept: () => true })
            .compile();

        controller = module.get<MarketController>(MarketController);
        jest.clearAllMocks();
    });

    it("GET /market calls findAllItems", async () => {
        const page = 2, limit = 3;
        const user = { id: "u" } as any;
        svc.findAllItems.mockResolvedValue({ data: [], total: 0, page, lastPage: 0 });
        const res = await controller.findAllItems(page, limit, { user } as any);
        expect(svc.findAllItems).toHaveBeenCalledWith(page, limit, user);
        expect(res.page).toBe(page);
    });

    it("GET /market/:id returns resource", async () => {
        const mi = { id: "m1" } as any;
        // await the async controller method
        await expect(controller.findOneItem(mi)).resolves.toBe(mi);
    });

    it("POST /market uploads & calls createItem", async () => {
        const files = [{ filename: "a.png" }] as any[];
        const dto = { title: "t", description: "d" } as any;
        const user = { id: "u1" } as any;
        svc.createItem.mockResolvedValue({ id: "c" } as any);
        const res = await controller.createItem(files, dto, { user } as any);
        expect(svc.createItem).toHaveBeenCalledWith(
            { ...dto, images: ["/uploads/market/a.png"] },
            user
        );
        expect(res.id).toBe("c");
    });

    it("PATCH /market/:id adds images & calls updateItem", async () => {
        const existing = { id: "m", images: ["old.png"] } as any;
        const files = [{ filename: "b.png" }] as any[];
        const dto = { description: "new" } as any;
        const user = { id: "u2" } as any;
        svc.updateItem.mockResolvedValue({} as any);
        await controller.updateItem(existing, files, dto, { user } as any);
        expect(svc.updateItem).toHaveBeenCalledWith(
            "m",
            { ...dto, images: ["old.png", "/uploads/market/b.png"] },
            user
        );
    });

    it("DELETE /market/:id calls removeItem", async () => {
        const mi = { id: "del" } as any;
        const user = { id: "u" } as any;
        svc.removeItem.mockResolvedValue(undefined);
        await controller.removeItem(mi, { user } as any);
        expect(svc.removeItem).toHaveBeenCalledWith("del", user);
    });
});
