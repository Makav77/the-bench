import { Test, TestingModule } from "@nestjs/testing";
import { PermissionsService } from "../permissions.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Permission } from "../entities/permission.entity";
import { UserRestriction } from "../entities/user-restriction.entity";
import { User } from "../../Users/entities/user.entity";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { DEFAULT_PERMISSIONS } from "../ListPermissions";
import { MoreThan, LessThanOrEqual } from "typeorm";

describe("PermissionsService", () => {
    let service: PermissionsService;
    let permRepo: any;
    let restrRepo: any;
    let userRepo: any;

    beforeEach(async () => {
        permRepo = { findOneBy: jest.fn(), save: jest.fn(), create: jest.fn() };
        restrRepo = { count: jest.fn(), create: jest.fn(), save: jest.fn(), delete: jest.fn(), findOne: jest.fn() };
        userRepo = { findOneBy: jest.fn() };
        const mod: TestingModule = await Test.createTestingModule({
            providers: [
                PermissionsService,
                { provide: getRepositoryToken(Permission), useValue: permRepo },
                { provide: getRepositoryToken(UserRestriction), useValue: restrRepo },
                { provide: getRepositoryToken(User), useValue: userRepo },
            ],
        }).compile();
        service = mod.get(PermissionsService);
    });

    it("onModuleInit seeds default permissions", async () => {
        permRepo.findOneBy.mockResolvedValue(null);
        permRepo.create.mockReturnValue({});
        await service.onModuleInit();
        expect(permRepo.save).toHaveBeenCalledTimes(DEFAULT_PERMISSIONS.length);
    });

    it("restrictUser error paths", async () => {
        permRepo.findOneBy.mockResolvedValue(null);
        await expect(service.restrictUser({} as any, "X", "u", "r", new Date(Date.now()+1000))).rejects.toThrow(NotFoundException);
        permRepo.findOneBy.mockResolvedValue({ id: "p" });
        userRepo.findOneBy.mockResolvedValue(null);
        await expect(service.restrictUser({} as any, "X", "u", "r", new Date(Date.now()+1000))).rejects.toThrow(NotFoundException);
        permRepo.findOneBy.mockResolvedValue({ id: "p" });
        userRepo.findOneBy.mockResolvedValue({ id: "u" });
        restrRepo.count.mockResolvedValue(1);
        await expect(service.restrictUser({} as any, "X", "u", "r", new Date(Date.now()+1000))).rejects.toThrow(BadRequestException);
    });

    it("restrictUser success", async () => {
        const perm = { id: "p" };
        const user = { id: "u" };
        permRepo.findOneBy.mockResolvedValue(perm);
        userRepo.findOneBy.mockResolvedValue(user);
        restrRepo.count.mockResolvedValue(0);
        restrRepo.create.mockReturnValue({ foo: "bar" });
        restrRepo.save.mockResolvedValue({ foo: "bar" });
        const expiresAt = new Date(Date.now()+1000);
        const res = await service.restrictUser({} as any, "code", "u", "reason", expiresAt);
        expect(res).toEqual({ foo: "bar" });
    });

    it("removeRestriction", async () => {
        permRepo.findOneBy.mockResolvedValue(null);
        await expect(service.removeRestriction({ id: "u" } as any, "X")).rejects.toThrow(NotFoundException);
        permRepo.findOneBy.mockResolvedValue({ id: "p" });
        await expect(service.removeRestriction({ id: "u" } as any, "X")).resolves.toBeUndefined();
    });

    it("isRestricted various paths", async () => {
        permRepo.findOneBy.mockResolvedValue(null);
        await expect(service.isRestricted({ id: "u" } as any, "X")).rejects.toThrow(NotFoundException);

        const perm = { id: "p" };
        permRepo.findOneBy.mockResolvedValue(perm);
        restrRepo.delete.mockResolvedValue({});
        restrRepo.findOne.mockResolvedValue(null);
        const out1 = await service.isRestricted({ id: "u" } as any, "X");
        expect(out1).toEqual({ restricted: false, expiresAt: null, reason: null });

        const restr = { expiresAt: new Date(Date.now()+1000), reason: "r" };
        restrRepo.findOne.mockResolvedValue(restr);
        const out2 = await service.isRestricted({ id: "u" } as any, "X");
        expect(out2).toEqual({ restricted: true, expiresAt: restr.expiresAt, reason: "r" });
    });

    it("getRestrictionInfo various paths", async () => {
        permRepo.findOneBy.mockResolvedValue(null);
        await expect(service.getRestrictionInfo({ id: "u" } as any, "X")).rejects.toThrow(NotFoundException);

        const perm = { id: "p" };
        permRepo.findOneBy.mockResolvedValue(perm);
        restrRepo.delete.mockResolvedValue({});
        restrRepo.findOne.mockResolvedValue(null);
        const out1 = await service.getRestrictionInfo({ id: "u" } as any, "X");
        expect(out1).toEqual({ restricted: false, expiresAt: null });

        restrRepo.findOne.mockResolvedValue({ expiresAt: new Date(Date.now()+500) });
        const out2 = await service.getRestrictionInfo({ id: "u" } as any, "X");
        expect(out2.restricted).toBe(true);
    });
});
