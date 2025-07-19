import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../auth.service";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../../Users/user.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { RefreshToken } from "../entities/refresh-token.entity";
import * as bcrypt from "bcryptjs";
import { UnauthorizedException } from "@nestjs/common";

const mockJwtService = { sign: jest.fn(), verify: jest.fn() };
const mockUserService = { findByEmail: jest.fn() };
const mockRefreshRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
};

jest.mock("bcryptjs", () => ({
    compare: jest.fn(),
}));

describe("AuthService", () => {
    let service: AuthService;
    const compareMock = bcrypt.compare as jest.Mock;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: JwtService, useValue: mockJwtService },
                { provide: UserService, useValue: mockUserService },
                { provide: getRepositoryToken(RefreshToken), useValue: mockRefreshRepo },
            ],
        }).compile();
        service = module.get<AuthService>(AuthService);
    });

    it("should return access and refresh tokens when credentials are valid", async () => {
        const fakeUser = { id: "1", email: "test@test.com", password: "hashedPassword", role: "User" };
        mockUserService.findByEmail.mockResolvedValue(fakeUser);
        compareMock.mockResolvedValue(true);
        mockJwtService.sign
            .mockReturnValueOnce("ACCESS_TOKEN")
            .mockReturnValueOnce("REFRESH_TOKEN");
        mockRefreshRepo.create.mockReturnValue({ token: "REFRESH_TOKEN", expiresAt: new Date(), revoked: false, user: fakeUser });
        mockRefreshRepo.save.mockResolvedValue(undefined);

        const result = await service.login({ email: "test@test.com", password: "password", rememberMe: false });

        expect(result.accessToken).toBe("ACCESS_TOKEN");
        expect(result.refreshToken).toBe("REFRESH_TOKEN");
    });

    it("should throw UnauthorizedException when password is invalid", async () => {
        mockUserService.findByEmail.mockResolvedValue({ password: "hasedPassword" });
        compareMock.mockResolvedValue(false);

        await expect(service.login({ email: "test@test.com", password: "pass", rememberMe: false }))
            .rejects
            .toBeInstanceOf(UnauthorizedException);
    });

    it("should refresh token when refreshToken is valid", async () => {
        const stored = { token: "OLD_RT", expiresAt: new Date(Date.now() + 10000), revoked: false, user: { id: "u1" } };
        mockRefreshRepo.findOne.mockResolvedValue(stored);
        mockJwtService.verify.mockReturnValue({ sub: "u1", email: "test@test.com", role: "User" });
        mockJwtService.sign.mockReturnValue("NEW_AT");

        const result = await service.refresh("OLD_RT");

        expect(result.accessToken).toBe("NEW_AT");
        expect(mockJwtService.verify).toHaveBeenCalledWith("OLD_RT");
        expect(mockJwtService.sign).toHaveBeenCalledWith(
            { sub: "u1", email: "test@test.com", role: "User" },
            { expiresIn: "15m" },
        );
    });

    it("should throw UnauthorizedException when refreshToken is invalid", async () => {
        mockRefreshRepo.findOne.mockResolvedValue(null);

        await expect(service.refresh("BAD_RT"))
            .rejects
            .toBeInstanceOf(UnauthorizedException);
    });

    it("should revoke refresh token on logout", async () => {
        const stored = { token: "RT1", expiresAt: new Date(Date.now() + 10000), revoked: false, user: { id: "u1" } };
        mockRefreshRepo.findOne.mockResolvedValue(stored);
        mockRefreshRepo.save.mockResolvedValue(undefined);

        await service.logout("RT1");

        expect(stored.revoked).toBe(true);
        expect(mockRefreshRepo.save).toHaveBeenCalledWith(stored);
    });
});
