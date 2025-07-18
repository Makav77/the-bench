import { Test, TestingModule } from "@nestjs/testing";
import { GalleryController } from "../gallery.controller";
import { GalleryService } from "../gallery.service";
import { JwtAuthGuard } from "../../Auth/guards/jwt-auth.guard";
import { IrisGuard } from "../../Auth/guards/iris.guard";
import { PermissionGuard } from "../../Permissions/guards/permission.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { GalleryItem } from "../entities/gallery-item.entity";

describe("GalleryController", () => {
    let controller: GalleryController;
    const svc = {
        findAllGalleryItems: jest.fn(),
        createGalleryItem: jest.fn(),
        toggleLike: jest.fn(),
        removeGalleryItem: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GalleryController],
            providers: [{ provide: GalleryService, useValue: svc }],
        })
            .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
            .overrideGuard(IrisGuard).useValue({ canActivate: () => true })
            .overrideGuard(PermissionGuard).useValue({ canActivate: () => true })
            .overrideInterceptor(FileInterceptor).useValue({ intercept: () => true })
            .compile();

        controller = module.get<GalleryController>(GalleryController);
        jest.clearAllMocks();
    });

    it("GET /gallery calls findAllGalleryItems", async () => {
        svc.findAllGalleryItems.mockResolvedValue({ data: [], total: 0, page: 1, lastPage: 0 });
        const req: any = { user: { id: "u1" } };
        const res = await controller.findAllGalleryItems(5, 10, req);
        expect(svc.findAllGalleryItems).toHaveBeenCalledWith(5, 10, req.user);
        expect(res.total).toBe(0);
    });

    it("GET /gallery/:id returns the resource", async () => {
        const gi = { id: "i1" } as GalleryItem;
        await expect(controller.findOneGalleryItem(gi)).resolves.toBe(gi);
    });

    it("POST /gallery throws if no file", async () => {
        const req: any = { user: { id: "u1" } };
        await expect(
            controller.createGalleryItem(null as any, { description: "d" } as any, req)
        ).rejects.toThrow("You must upload one image.");
    });

    it("POST /gallery with file passes URL", async () => {
        const file = { filename: "pic.png" } as any;
        const created = { id: "g1", url: "/uploads/gallery/pic.png" } as any;
        svc.createGalleryItem.mockResolvedValue(created);
        const req: any = { user: { id: "u1" } };
        const res = await controller.createGalleryItem(file, { description: "desc" } as any, req);
        expect(svc.createGalleryItem).toHaveBeenCalledWith(
            "desc",
            expect.stringContaining("pic.png"),
            req.user
        );
        expect(res).toBe(created);
    });

    it("POST /gallery/:id/like calls toggleLike", async () => {
        const gi = { id: "i3" } as any;
        const out = { id: "i3", likedBy: ["u1"] } as any;
        svc.toggleLike.mockResolvedValue(out);
        const req: any = { user: { id: "u1" } };
        const res = await controller.toggleLike(gi, req);
        expect(svc.toggleLike).toHaveBeenCalledWith("i3", req.user);
        expect(res).toBe(out);
    });

    it("DELETE /gallery/:id calls removeGalleryItem", async () => {
        const gi = { id: "i4" } as any;
        svc.removeGalleryItem.mockResolvedValue(undefined);
        const req: any = { user: { id: "u1" } };
        await controller.removeGalleryItem(gi, req);
        expect(svc.removeGalleryItem).toHaveBeenCalledWith("i4", req.user);
    });
});
