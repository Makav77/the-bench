import { Test, TestingModule } from "@nestjs/testing";
import { NewsController } from "../news.controller";
import { NewsService } from "../news.service";
import { JwtAuthGuard } from "../../Auth/guards/jwt-auth.guard";
import { IrisGuard } from "../../Auth/guards/iris.guard";
import { PermissionGuard } from "../../Permissions/guards/permission.guard";

describe("NewsController", () => {
    let controller: NewsController;
    const svc = {
        uploadImages: jest.fn(),
        findPendingNews: jest.fn(),
        findOneNews: jest.fn(),
        toggleLike: jest.fn(),
        getLikes: jest.fn(),
        findAllNews: jest.fn(),
        createNews: jest.fn(),
        updateNews: jest.fn(),
        removeNews: jest.fn(),
        validateNews: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [NewsController],
            providers: [{ provide: NewsService, useValue: svc }],
        })
            .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
            .overrideGuard(IrisGuard).useValue({ canActivate: () => true })
            .overrideGuard(PermissionGuard).useValue({ canActivate: () => true })
            .compile();

        controller = module.get(NewsController);
        jest.clearAllMocks();
    });

    it("POST /upload-images returns urls", async () => {
        const files = [{ filename: "a.png" }, { filename: "b.jpg" }] as any[];
        const out = await controller.uploadImages(files);
        expect(out.urls).toEqual(["/uploads/news/a.png", "/uploads/news/b.jpg"]);
    });

    it("GET /pending calls service", async () => {
        const page = 1, limit = 2;
        const req: any = { user: { id: "u" } };
        svc.findPendingNews.mockResolvedValue({ data: [], total: 0, page, lastPage: 0 });
        const res = await controller.findPendingNews(page, limit, req);
        expect(svc.findPendingNews).toHaveBeenCalledWith(page, limit, req.user);
        expect(res.page).toBe(page);
    });

    it("GET /:id returns resource directly", async () => {
        const doc = { id: "n3" } as any;
        const out = await controller.findOneNews(doc);
        expect(out).toBe(doc);
    });

    it("POST /:id/like calls toggleLike", async () => {
        const req: any = { user: { id: "u" } };
        svc.findOneNews.mockResolvedValue({ id: "n" } as any);
        svc.toggleLike.mockResolvedValue({ liked: true, totalLikes: 1 });
        const out = await controller.toggleLike("n", req);
        expect(svc.findOneNews).toHaveBeenCalledWith("n");
        expect(svc.toggleLike).toHaveBeenCalledWith("n", req.user);
        expect(out.liked).toBe(true);
    });

    it("GET /:id/likes calls getLikes", async () => {
        const req: any = { user: { id: "u" } };
        svc.findOneNews.mockResolvedValue({ id: "n" } as any);
        svc.getLikes.mockResolvedValue({ liked: false, totalLikes: 0 });
        const out = await controller.getLikes("n", req);
        expect(svc.getLikes).toHaveBeenCalledWith("n", req.user);
        expect(out.totalLikes).toBe(0);
    });

    it("GET / calls findAllNews", async () => {
        const req: any = { user: { id: "u" } };
        svc.findAllNews.mockResolvedValue({ data: [], total: 0, page: 1, lastPage: 0 });
        await controller.findAllNews(1, 5, req);
        expect(svc.findAllNews).toHaveBeenCalledWith(1, 5, req.user);
    });

    it("POST / calls createNews", async () => {
        const dto = { title: "t", content: "c", authorId: "u" } as any;
        const req: any = { user: { id: "u" } };
        svc.createNews.mockResolvedValue({ id: "x" } as any);
        const out = await controller.createNews(dto, req);
        expect(svc.createNews).toHaveBeenCalledWith(dto, req.user);
        expect((out as any).id).toBe("x");
    });

    it("PATCH /:id calls updateNews", async () => {
        const dto = { title: "new" } as any;
        const req: any = { user: { id: "u" } };
        svc.findOneNews.mockResolvedValue({ id: "n" } as any);
        svc.updateNews.mockResolvedValue({ id: "n" } as any);
        await controller.updateNews("n", dto, req);
        expect(svc.updateNews).toHaveBeenCalledWith("n", dto, req.user);
    });

    it("DELETE /:id calls removeNews", async () => {
        const req: any = { user: { id: "u" } };
        svc.findOneNews.mockResolvedValue({ id: "n" } as any);
        svc.removeNews.mockResolvedValue(undefined);
        await controller.removeNews("n", req);
        expect(svc.removeNews).toHaveBeenCalledWith("n", req.user);
    });

    it("PATCH /:id/validate calls validateNews", async () => {
        const dto = { validated: true } as any;
        const req: any = { user: { id: "u" } };
        svc.findOneNews.mockResolvedValue({ id: "n" } as any);
        svc.validateNews.mockResolvedValue({ status: "APPROVED" } as any);
        const out = await controller.validateNews("n", dto, req);
        expect(svc.validateNews).toHaveBeenCalledWith("n", dto, req.user);
        expect(out.status).toBe("APPROVED");
    });
});
