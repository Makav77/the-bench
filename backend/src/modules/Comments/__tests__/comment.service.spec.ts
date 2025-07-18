import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CommentService } from "../comment.service";
import { Comment, CommentDocument } from "../comment.schema";
import { CreateCommentDTO } from "../dto/create-comment.dto";
import { UpdateCommentDTO } from "../dto/update-comment.dto";
import { NotFoundException, ForbiddenException } from "@nestjs/common";
import { User } from "../../Users/entities/user.entity";

describe("CommentService", () => {
    let service: CommentService;
    let model: Model<CommentDocument>;

    class MockComment {
        newsId: string;
        authorId: string;
        authorName: string;
        authorAvatar: string;
        content: string;
        irisCode: string;
        irisName: string;
        likedBy: string[];
        constructor(data: any) {
            Object.assign(this, data);
            this.likedBy = data.likedBy ?? [];
        }
        save = jest.fn().mockImplementation(() => Promise.resolve(this));
        deleteOne = jest.fn().mockResolvedValue({});
    }

    const mockModel = {
        find: jest.fn(),
        findById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommentService,
                { provide: getModelToken(Comment.name), useValue: mockModel },
            ],
        }).compile();

        service = module.get(CommentService);
        model = module.get(getModelToken(Comment.name));
    });

    describe("findAllComments", () => {
        it("filtre par irisCode pour USER", async () => {
            const docs = [{ id: "1" }, { id: "2" }];
            mockModel.find.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(docs),
            });
            const user = { role: "user", irisCode: "IC" } as User;
            const res = await service.findAllComments("news1", user);
            expect(model.find).toHaveBeenCalledWith({ newsId: "news1", irisCode: "IC" });
            expect(res).toEqual(docs);
        });

        it("ne filtre pas irisCode pour ADMIN", async () => {
            mockModel.find.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue([]),
            });
            const admin = { role: "admin" } as User;
            await service.findAllComments("news1", admin);
            expect(model.find).toHaveBeenCalledWith({ newsId: "news1" });
        });
    });

    describe("findOneComment", () => {
        it("retourne le document si trouvé", async () => {
            const doc = new MockComment({ id: "c1" });
            mockModel.findById.mockResolvedValue(doc);
            await expect(service.findOneComment("c1")).resolves.toBe(doc);
        });
        it("throw NotFoundException si introuvable", async () => {
            mockModel.findById.mockResolvedValue(null);
            await expect(service.findOneComment("x")).rejects.toThrow(NotFoundException);
        });
    });

    describe("createComment", () => {
        it("enregistre et renvoie le nouveau comment", async () => {
            const dto: CreateCommentDTO = {
                newsId: "n1",
                authorId: "u1",
                authorName: "A B",
                authorAvatar: "pic.png",
                content: "hey",
            };
            const user = { irisCode: "IC", irisName: "IN" } as User;
            (model as any) = jest.fn().mockImplementation((data) => new MockComment(data));
            service["commentModel"] = model;
            const res = await service.createComment(dto, user);
            expect(res).toBeInstanceOf(MockComment);
            expect(res.irisCode).toBe("IC");
            expect(res.irisName).toBe("IN");
        });
    });

    describe("updateComment", () => {
        it("modifie le contenu pour l'auteur", async () => {
            const orig = new MockComment({
                id: "c", irisCode: "IC", authorId: "u1", content: "old",
            });
            mockModel.findById.mockResolvedValue(orig);
            const user = { id: "u1", role: "user", irisCode: "IC" } as User;
            const dto: UpdateCommentDTO = { content: "new" };
            const res = await service.updateComment("c", user, dto);
            expect(orig.save).toHaveBeenCalled();
            expect(res.content).toBe("new");
        });
        it("throw si pas trouvé", async () => {
            mockModel.findById.mockResolvedValue(null);
            await expect(
                service.updateComment("x", { id: "u" } as User, {}),
            ).rejects.toThrow(NotFoundException);
        });
        it("throw Forbidden si irisCode", async () => {
            const orig = new MockComment({
                id: "c", irisCode: "X", authorId: "u1", content: "o",
            });
            mockModel.findById.mockResolvedValue(orig);
            await expect(
                service.updateComment("c", { id: "u", role: "user", irisCode: "IC" } as User, {}),
            ).rejects.toThrow(ForbiddenException);
        });
        it("throw Forbidden si pas auteur ni admin/modérateur", async () => {
            const orig = new MockComment({
                id: "c", irisCode: "IC", authorId: "u2", content: "o",
            });
            mockModel.findById.mockResolvedValue(orig);
            await expect(
                service.updateComment("c", { id: "u1", role: "user", irisCode: "IC" } as User, {}),
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe("removeComment", () => {
        it("supprime si authorId ou admin/modérateur", async () => {
            const orig = new MockComment({
                id: "c", irisCode: "IC", authorId: "u1",
            });
            mockModel.findById.mockResolvedValue(orig);
            await expect(
                service.removeComment("c", { id: "u1", role: "user", irisCode: "IC" } as any, false),
            ).resolves.toBeUndefined();
            expect(orig.deleteOne).toHaveBeenCalled();
        });
        it("throw NotFound si introuvable", async () => {
            mockModel.findById.mockResolvedValue(null);
            await expect(
                service.removeComment("x", { id: "u" } as any, true),
            ).rejects.toThrow(NotFoundException);
        });
        it("throw Forbidden si irisCode et pas admin", async () => {
            const orig = new MockComment({
                id: "c", irisCode: "X", authorId: "u1",
            });
            mockModel.findById.mockResolvedValue(orig);
            await expect(
                service.removeComment("c", { id: "u1", role: "user", irisCode: "IC" } as any, true),
            ).rejects.toThrow(ForbiddenException);
        });
        it("throw Forbidden si pas author et pas admin/modérateur", async () => {
            const orig = new MockComment({
                id: "c", irisCode: "IC", authorId: "u2",
            });
            mockModel.findById.mockResolvedValue(orig);
            await expect(
                service.removeComment("c", { id: "u1", role: "user", irisCode: "IC" } as any, false),
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe("toggleLike", () => {
        it("ajoute un like si pas déjà", async () => {
            const orig = new MockComment({
                id: "c", irisCode: "IC", likedBy: [],
            });
            mockModel.findById.mockResolvedValue(orig);
            const res = await service.toggleLike("c", { id: "u1", role: "user", irisCode: "IC" } as User);
            expect(res.liked).toBe(true);
            expect(res.totalLikes).toBe(1);
        });
        it("retire le like si déjà présent", async () => {
            const orig = new MockComment({
                id: "c", irisCode: "IC", likedBy: ["u1"],
            });
            mockModel.findById.mockResolvedValue(orig);
            const res = await service.toggleLike("c", { id: "u1", role: "user", irisCode: "IC" } as User);
            expect(res.liked).toBe(false);
            expect(res.totalLikes).toBe(0);
        });
        it("throw NotFound si introuvable", async () => {
            mockModel.findById.mockResolvedValue(null);
            await expect(
                service.toggleLike("x", { id: "u1", role: "user", irisCode: "IC" } as User),
            ).rejects.toThrow(NotFoundException);
        });
        it("throw Forbidden si irisCode différent", async () => {
            const orig = new MockComment({ id: "c", irisCode: "X", likedBy: [] });
            mockModel.findById.mockResolvedValue(orig);
            await expect(
                service.toggleLike("c", { id: "u1", role: "user", irisCode: "IC" } as User),
            ).rejects.toThrow(ForbiddenException);
        });
    });
});
