import { Test, TestingModule } from "@nestjs/testing";
import { ChallengesController } from "../challenges.controller";
import { ChallengesService } from "../challenges.service";
import { JwtAuthGuard } from "../../Auth/guards/jwt-auth.guard";
import { IrisGuard } from "../../Auth/guards/iris.guard";
import { PermissionGuard } from "../../Permissions/guards/permission.guard";
import { FileInterceptor } from "@nestjs/platform-express";

describe("ChallengesController", () => {
    let controller: ChallengesController;
    const mockSvc = {
        findPendingChallenges: jest.fn(),
        findAllChallenges: jest.fn(),
        findOneChallenge: jest.fn(),
        findPendingCompletions: jest.fn(),
        createChallenge: jest.fn(),
        updateChallenge: jest.fn(),
        validateChallenge: jest.fn(),
        removeChallenge: jest.fn(),
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
        submitCompletion: jest.fn(),
        validateCompletion: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ChallengesController],
            providers: [{ provide: ChallengesService, useValue: mockSvc }],
        })
            .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
            .overrideGuard(IrisGuard).useValue({ canActivate: () => true })
            .overrideGuard(PermissionGuard).useValue({ canActivate: () => true })
            .overrideInterceptor(FileInterceptor).useValue({ intercept: () => true })
            .compile();

        controller = module.get(ChallengesController);
        jest.clearAllMocks();
    });

    it("GET /challenges calls findAllChallenges", async () => {
        const user = { id: "u1" } as any;
        mockSvc.findAllChallenges.mockResolvedValue({ data: [], total: 0, page: 1, lastPage: 0 });
        const res = await controller.findAllChallenges(1, 5, { user } as any);
        expect(mockSvc.findAllChallenges).toHaveBeenCalledWith(1, 5, user);
        expect(res.data).toEqual([]);
    });

    it("GET /pending calls findPendingChallenges", async () => {
        const user = { id: "u1" } as any;
        mockSvc.findPendingChallenges.mockResolvedValue({ data: [], total: 0, page: 2, lastPage: 0 });
        const out = await controller.findPendingChallenges(2, 3, { user } as any);
        expect(mockSvc.findPendingChallenges).toHaveBeenCalledWith(2, 3, user);
        expect(out.page).toBe(2);
    });

    it("GET /:id returns resource directly", async () => {
        const ent = { id: "c1" } as any;
        const res = await controller.findOneChallenge(ent);
        expect(res).toBe(ent);
    });

    it("GET /completions/pending calls findPendingCompletions", async () => {
        mockSvc.findPendingCompletions.mockResolvedValue({ data: [], total: 0, page: 1, lastPage: 0 });
        const out = await controller.findPendingCompletions(1, 2, { user: {} as any } as any);
        expect(mockSvc.findPendingCompletions).toHaveBeenCalledWith(1, 2, {} as any);
        expect(out.total).toBe(0);
    });

    it("POST / challenges crée via createChallenge", async () => {
        const dto = { title: "T" } as any;
        mockSvc.createChallenge.mockResolvedValue({ id: "c" } as any);
        const out = await controller.createChallenge(dto, { user: { id: "u1" } } as any);
        expect(mockSvc.createChallenge).toHaveBeenCalledWith(dto, { id: "u1" });
        expect(out.id).toBe("c");
    });

    it("PATCH /:id updateChallenge", async () => {
        const dto = { title: "N" } as any;
        const ent = { id: "c1" } as any;
        mockSvc.updateChallenge.mockResolvedValue({} as any);
        await controller.updateChallenge(ent, dto, { user: { id: "u1" } } as any);
        expect(mockSvc.updateChallenge).toHaveBeenCalledWith("c1", dto, { id: "u1" });
    });

    it("PATCH /:id/validate validateChallenge", async () => {
        const dto = { validated: true } as any;
        const ent = { id: "c1" } as any;
        mockSvc.validateChallenge.mockResolvedValue({} as any);
        await controller.validateChallenge(ent, dto, { user: { id: "u1" } } as any);
        expect(mockSvc.validateChallenge).toHaveBeenCalledWith("c1", dto, { id: "u1" });
    });

    it("DELETE /:id removeChallenge", async () => {
        const ent = { id: "c1" } as any;
        mockSvc.removeChallenge.mockResolvedValue(undefined);
        await controller.removeChallenge(ent, { user: { id: "u1" } } as any);
        expect(mockSvc.removeChallenge).toHaveBeenCalledWith("c1", { id: "u1" });
    });

    it("POST /:id/subscribe subscribe", async () => {
        const ent = { id: "c1" } as any;
        mockSvc.subscribe.mockResolvedValue(ent);
        const out = await controller.subscribe(ent, { user: { id: "u1" } } as any);
        expect(mockSvc.subscribe).toHaveBeenCalledWith("c1", { id: "u1" });
        expect(out).toBe(ent);
    });

    it("DELETE /:id/subscribe unsubscribe", async () => {
        const ent = { id: "c1" } as any;
        mockSvc.unsubscribe.mockResolvedValue(ent);
        const out = await controller.unsubscribe(ent, { user: { id: "u1" } } as any);
        expect(mockSvc.unsubscribe).toHaveBeenCalledWith("c1", { id: "u1" });
        expect(out).toBe(ent);
    });

    it("POST /:id/complete sans preuve rejette", async () => {
        await expect(controller.submitCompletion(
            { id: "c1" } as any,
            null as any,
            { text: "", imageUrl: "" } as any,
            { user: { id: "u1" } } as any
        )).rejects.toThrow("Merci de fournir une preuve texte ou image 😊");
    });

    it("POST /:id/complete happy path", async () => {
        const file = { filename: "f.png" } as any;
        mockSvc.submitCompletion.mockResolvedValue({ text: "t", imageUrl: "/uploads/challenge_completions/f.png" } as any);
        const out = await controller.submitCompletion(
            { id: "c1" } as any,
            file,
            { text: "", imageUrl: "" } as any,
            { user: { id: "u1" } } as any
        );
        expect(mockSvc.submitCompletion).toHaveBeenCalledWith(
            "c1",
            expect.objectContaining({ imageUrl: expect.stringContaining("f.png") }),
            { id: "u1" }
        );
        expect(out.imageUrl).toContain("f.png");
    });

    it("PATCH /:id/complete/:cid validateCompletion", async () => {
        const dto = { validated: false, rejectedReason: "no" } as any;
        mockSvc.validateCompletion.mockResolvedValue({} as any);
        const out = await controller.validateCompletion(
            { id: "c1" } as any,
            "cid",
            dto,
            { user: { id: "u1" } } as any
        );
        expect(mockSvc.validateCompletion).toHaveBeenCalledWith("c1", "cid", dto, { id: "u1" });
        expect(out).toEqual({});
    });
});
