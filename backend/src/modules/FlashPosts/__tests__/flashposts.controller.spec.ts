import { Test, TestingModule } from "@nestjs/testing";
import { FlashPostsController } from "../flashposts.controller";
import { FlashPostsService } from "../flashposts.service";
import { JwtAuthGuard } from "../../Auth/guards/jwt-auth.guard";
import { IrisGuard } from "../../Auth/guards/iris.guard";
import { PermissionGuard } from "../../Permissions/guards/permission.guard";
import { RequestWithResource } from "../../Utils/request-with-resource.interface";
import { FlashPost } from "../entities/flash-post.entity";

describe("FlashPostsController", () => {
    let controller: FlashPostsController;
    const svc = {
        findAllFlashPosts: jest.fn(),
        findOneFlashPost: jest.fn(),
        createFlashPost: jest.fn(),
        updateFlashPost: jest.fn(),
        removeFlashPost: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FlashPostsController],
            providers: [{ provide: FlashPostsService, useValue: svc }],
        })
            .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
            .overrideGuard(IrisGuard).useValue({ canActivate: () => true })
            .overrideGuard(PermissionGuard).useValue({ canActivate: () => true })
            .compile();

        controller = module.get(FlashPostsController);
        jest.clearAllMocks();
    });

    it("GET flashposts appelle findAllFlashPosts", async () => {
        const page = 3, limit = 7;
        const user = { id: "u1" } as any;
        svc.findAllFlashPosts.mockResolvedValue({ data: [], total: 0, page, lastPage: 0 });
        const res = await controller.findAllFlashPosts(page, limit, { user } as RequestWithResource<FlashPost>);
        expect(svc.findAllFlashPosts).toHaveBeenCalledWith(page, limit, user);
        expect(res.page).toBe(page);
    });

    it("GET flashposts/:id retourne ressource", async () => {
        const fp = { id: "fp1" } as any;
        const res = await controller.findOneFlashPost(fp);
        expect(res).toBe(fp);
    });

    it("POST flashposts crée un flashpost", async () => {
        const dto = { title: "T", description: "D" } as any;
        const user = { id: "u1" } as any;
        const created = { id: "fp2" } as any;
        svc.createFlashPost.mockResolvedValue(created);
        const res = await controller.createFlashPost(dto, { user } as RequestWithResource<FlashPost>);
        expect(svc.createFlashPost).toHaveBeenCalledWith(dto, user);
        expect(res).toBe(created);
    });

    it("PATCH flashposts/:id updateFlashPost", async () => {
        const dto = { description: "X" } as any;
        const fp = { id: "fp3" } as any;
        const user = { id: "u1" } as any;
        const updated = { id: "fp3" } as any;
        svc.updateFlashPost.mockResolvedValue(updated);
        const res = await controller.updateFlashPost(fp, dto, { user } as RequestWithResource<FlashPost>);
        expect(svc.updateFlashPost).toHaveBeenCalledWith("fp3", dto, user);
        expect(res).toBe(updated);
    });

    it("DELETE flashposts/:id removeFlashPost", async () => {
        const fp = { id: "fp4" } as any;
        const user = { id: "u1" } as any;
        svc.removeFlashPost.mockResolvedValue(undefined);
        const res = await controller.removeFlashPost(fp, { user } as RequestWithResource<FlashPost>);
        expect(svc.removeFlashPost).toHaveBeenCalledWith("fp4", user);
        expect(res).toBeUndefined();
    });
});
