import { Test, TestingModule } from "@nestjs/testing";
import { PermissionsController } from "../permissions.controller";
import { PermissionsService } from "../permissions.service";
import { BadRequestException } from "@nestjs/common";

describe("PermissionsController", () => {
    let controller: PermissionsController;
    const svc = {
        restrictUser: jest.fn(),
        removeRestriction: jest.fn(),
        isRestricted: jest.fn(),
    };

    beforeEach(async () => {
        const mod: TestingModule = await Test.createTestingModule({
            controllers: [PermissionsController],
            providers: [{ provide: PermissionsService, useValue: svc }],
        }).compile();
        controller = mod.get(PermissionsController);
        jest.clearAllMocks();
    });

    it("restrictUser rejects non-positive duration", async () => {
        const dto = { userId: "u", reason: "r", days: 0, hours: 0, minutes: 0 };
        await expect(controller.restrictUser("code", dto, { user: {} } as any))
            .rejects.toThrow(BadRequestException);
    });

    it("restrictUser calls service with correct args", async () => {
        const dto = { userId: "u", reason: "r", days: 0, hours: 1, minutes: 0 };
        svc.restrictUser.mockResolvedValue({ id: "x" });
        const out = await controller.restrictUser("code", dto, { user: { id: "actor" } } as any);
        expect(svc.restrictUser).toHaveBeenCalled();
        expect(out).toEqual({ id: "x" });
    });

    it("removeRestriction calls service", async () => {
        await controller.removeRestriction("code", { user: { id: "u" } } as any);
        expect(svc.removeRestriction).toHaveBeenCalledWith({ id: "u" }, "code");
    });

    it("isRestricted returns service data", async () => {
        const mock = { restricted: true, expiresAt: new Date(), reason: "r" };
        svc.isRestricted.mockResolvedValue(mock);
        const out = await controller.isRestricted("c", { user: { id: "u" } } as any);
        expect(out).toEqual(mock);
    });
});
