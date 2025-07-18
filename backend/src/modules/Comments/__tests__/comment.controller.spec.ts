import { Test, TestingModule } from "@nestjs/testing";
import { CommentController } from "../comment.controller";
import { CommentService } from "../comment.service";
import { UserService } from "../../Users/user.service";
import { JwtAuthGuard } from "../../Auth/guards/jwt-auth.guard";
import { IrisGuard } from "../../Auth/guards/iris.guard";
import { RequestWithResource } from "../../Utils/request-with-resource.interface";
import { NotFoundException } from "@nestjs/common";

describe("CommentController", () => {
    let controller: CommentController;
    const mockSvc = {
        findAllComments: jest.fn(),
        findOneComment: jest.fn(),
        createComment: jest.fn(),
        updateComment: jest.fn(),
        removeComment: jest.fn(),
        toggleLike: jest.fn(),
    };
    const mockUserSvc = {
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CommentController],
            providers: [
                { provide: CommentService, useValue: mockSvc },
                { provide: UserService, useValue: mockUserSvc },
            ],
        })
            .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
            .overrideGuard(IrisGuard).useValue({ canActivate: () => true })
            .compile();

        controller = module.get(CommentController);
        jest.clearAllMocks();
    });

    it("GET / comments appelle findAllComments", async () => {
        const newsId = "n1";
        const user = { id: "u1" } as any;
        mockSvc.findAllComments.mockResolvedValue([]);
        const res = await controller.findAllComments(newsId, { user } as RequestWithResource<any>);
        expect(mockSvc.findAllComments).toHaveBeenCalledWith(newsId, user);
        expect(res).toEqual([]);
    });

    it("POST / crée un commentaire", async () => {
        const newsId = "n1";
        const content = "hey";
        const user = { id: "u1", firstname: "A", lastname: "B", irisCode: "IC", irisName: "IN" } as any;
        mockUserSvc.findOne.mockResolvedValue({ profilePicture: "pic.png" });
        const created = { id: "c1", content } as any;
        mockSvc.createComment.mockResolvedValue(created);

        const res = await controller.create(newsId, content, { user } as RequestWithResource<any>);
        expect(mockUserSvc.findOne).toHaveBeenCalledWith("u1");
        expect(mockSvc.createComment).toHaveBeenCalledWith(expect.objectContaining({
            newsId, content,
            authorId: "u1",
            authorName: "A B",
            authorAvatar: "pic.png",
            irisCode: "IC",
            irisName: "IN",
        }), user);
        expect(res).toBe(created);
    });

    it("PATCH /:commentId updateComment", async () => {
        const dto = { content: "new" } as any;
        const comment = { id: "c1" } as any;
        const user = { id: "u1" } as any;
        const updated = { id: "c1", content: "new" } as any;
        mockSvc.updateComment.mockResolvedValue(updated);

        const res = await controller.updateComment(comment, dto, { user } as RequestWithResource<any>);
        expect(mockSvc.updateComment).toHaveBeenCalledWith("c1", user, dto);
        expect(res).toBe(updated);
    });

    it("DELETE /:commentId removeComment", async () => {
        const comment = { id: "c1" } as any;
        const user = { id: "u1", role: "user", irisCode: "IC" } as any;
        mockSvc.removeComment.mockResolvedValue(undefined);

        const res = await controller.removeComment(comment, { user } as RequestWithResource<any>);
        expect(mockSvc.removeComment).toHaveBeenCalledWith("c1", user, false);
        expect(res).toEqual({ deleted: true });
    });

    it("POST /:commentId/like happy path", async () => {
        const commentId = "c1";
        const user = { id: "u1" } as any;
        const commentDoc = { id: "c1", irisCode: "IC" } as any;
        mockSvc.findOneComment.mockResolvedValue(commentDoc);
        mockSvc.toggleLike.mockResolvedValue({ liked: true, totalLikes: 1 });

        const res = await controller.toggleLike("n1", commentId, { user } as RequestWithResource<any>);
        expect(mockSvc.findOneComment).toHaveBeenCalledWith(commentId);
        expect(mockSvc.toggleLike).toHaveBeenCalledWith(commentId, user);
        expect(res).toEqual({ liked: true, totalLikes: 1 });
    });

    it("POST /:commentId/like throw NotFound if no comment", async () => {
        mockSvc.findOneComment.mockResolvedValue(null);
        await expect(
            controller.toggleLike("n1", "bad", { user: { id: "u1" } } as any),
        ).rejects.toThrow(NotFoundException);
    });
});
