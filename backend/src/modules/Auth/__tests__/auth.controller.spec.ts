import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../auth.controller";
import { AuthService } from "../auth.service";
import { Request, Response } from "express";

describe("AuthController", () => {
    let controller: AuthController;
    const mockAuthService = {
        login: jest.fn(),
        refresh: jest.fn(),
        logout: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [{ provide: AuthService, useValue: mockAuthService }],
        }).compile();
        controller = module.get<AuthController>(AuthController);
        jest.clearAllMocks();
    });

    it("should call AuthService.login and set cookie", async () => {
        mockAuthService.login.mockResolvedValue({
            accessToken: "AT",
            refreshToken: "RT",
            refreshOptions: { httpOnly: true },
        });
        const res = { cookie: jest.fn() } as unknown as Response;

        const result = await controller.login(
            { email: "test@test.com", password: "password", rememberMe: false },
            res,
        );

        expect(mockAuthService.login).toHaveBeenCalledWith({ email: "test@test.com", password: "password", rememberMe: false });
        expect(res.cookie).toHaveBeenCalledWith("refreshToken", "RT", { httpOnly: true });
        expect(result).toEqual({ accessToken: "AT" });
    });

    it("should refresh token", async () => {
        mockAuthService.refresh.mockResolvedValue({ accessToken: "NEW_AT" });
        const req = { cookies: { refreshToken: "OLD_RT" } } as unknown as Request;
        const res = {} as unknown as Response;

        const result = await controller.refresh(req, res);

        expect(mockAuthService.refresh).toHaveBeenCalledWith("OLD_RT");
        expect(result).toEqual({ accessToken: "NEW_AT" });
    });

    it("should clear cookie on logout", async () => {
        mockAuthService.logout.mockResolvedValue(undefined);
        const req = { cookies: { refreshToken: "RT1" } } as unknown as Request;
        const res = { clearCookie: jest.fn() } as unknown as Response;

        const result = await controller.logout(req, res);

        expect(mockAuthService.logout).toHaveBeenCalledWith("RT1");
        expect(res.clearCookie).toHaveBeenCalledWith("refreshToken", { path: "/" });
        expect(result).toEqual({ message: "Logout successfull." });
    });
});
