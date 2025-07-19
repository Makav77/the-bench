import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "../user.controller";
import { UserService } from "../user.service";
import { JwtAuthGuard } from "../../Auth/guards/jwt-auth.guard";

describe("UserController", () => {
    let controller: UserController;
    const svc = {
        getStaff: jest.fn(),
        findAll: jest.fn(),
        searchUsers: jest.fn(),
        findOne: jest.fn(),
        getProfileSummary: jest.fn(),
        getFriends: jest.fn(),
        create: jest.fn(),
        sendFriendRequest: jest.fn(),
        acceptFriendRequest: jest.fn(),
        rejectFriendRequest: jest.fn(),
        cancelFriendRequest: jest.fn(),
        removeFriend: jest.fn(),
        getFriendStatus: jest.fn(),
        updateAddress: jest.fn(),
        remove: jest.fn(),
        update: jest.fn(),
        uploadProfilePicture: jest.fn(),
        getPendingFriendRequests: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [{ provide: UserService, useValue: svc }],
        })
            .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
            .compile();
        controller = module.get<UserController>(UserController);
        jest.clearAllMocks();
    });

    it("GET /users/staff", async () => {
        svc.getStaff.mockResolvedValue("staff");
        const out = await controller.getStaff({ user: { id: "u1" } } as any);
        expect(svc.getStaff).toHaveBeenCalledWith("u1");
        expect(out).toBe("staff");
    });

    it("GET /users", async () => {
        svc.findAll.mockResolvedValue(["u"]);
        expect(await controller.findAll()).toEqual(["u"]);
    });

    it("GET /users/search", async () => {
        svc.searchUsers.mockResolvedValue([{ id: "u2" }]);
        const out = await controller.searchUsers("foo", { user: { irisCode: "X", role: "user" } } as any);
        expect(svc.searchUsers).toHaveBeenCalledWith("foo","X","user");
        expect(out).toEqual([{ id: "u2" }]);
    });

    it("GET /users/:id", async () => {
        svc.findOne.mockResolvedValue({ id: "u3" });
        expect(await controller.findOne("u3")).toEqual({ id: "u3" });
    });

    it("GET /users/:id/profile", async () => {
        svc.getProfileSummary.mockResolvedValue({ id: "u4" } as any);
        expect(await controller.getProfileSummary("u4",{ user:{ id:"x" } } as any)).toEqual({ id: "u4" });
    });

    it("POST /users", async () => {
        svc.create.mockResolvedValue({ id: "u5" } as any);
        expect(await controller.create({} as any)).toEqual({ id: "u5" });
    });

    it("PATCH /users/:id", async () => {
        svc.update.mockResolvedValue({ id: "u6" } as any);
        expect(await controller.update("u6", {} as any)).toEqual({ id: "u6" });
    });

    it("DELETE /users/:id", async () => {
        svc.remove.mockResolvedValue(undefined);
        await expect(controller.remove("u7")).resolves.toBeUndefined();
    });

    it("friend request endpoints", async () => {
        await controller.sendFriendRequest("a",{ user:{ id:"u" } } as any);
        expect(svc.sendFriendRequest).toHaveBeenCalledWith("u","a");

        await controller.acceptFriendRequest("b",{ user:{ id:"u" } } as any);
        expect(svc.acceptFriendRequest).toHaveBeenCalledWith("u","b");

        await controller.rejectFriendRequest("c",{ user:{ id:"u" } } as any);
        expect(svc.rejectFriendRequest).toHaveBeenCalledWith("u","c");

        await controller.cancelFriendRequest("d",{ user:{ id:"u" } } as any);
        expect(svc.cancelFriendRequest).toHaveBeenCalledWith("u","d");

        await controller.removeFriend("e",{ user:{ id:"u" } } as any);
        expect(svc.removeFriend).toHaveBeenCalledWith("u","e");
    });

    it("GET /users/:id/friend-status", async () => {
        svc.getFriendStatus.mockResolvedValue({ areFriends: true, requestSent: false, requestReceived: false });
        const out = await controller.getFriendStatus("t",{ user:{ id:"u" } } as any);
        expect(svc.getFriendStatus).toHaveBeenCalledWith("u","t");
        expect(out.areFriends).toBe(true);
    });
});
