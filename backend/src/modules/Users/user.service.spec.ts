import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { Role } from "./entities/user.entity";
import { CreateUserDTO } from "./dto/create-user.dto";

const mockUser = {
    "id": "b1c4a89e-4905-5e3c-b57f-dc92627d011e",
    "firstname": "John",
    "lastname": "Doe",
    "email": "test@example.com",
    "password": "password",
    "dateOfBirth": new Date("2000-01-01"),
    "profilePicture": "none",
    "role": Role.ADMIN
};

describe("UserService", () => {
    let service: UserService;
    let repo: jest.Mocked<Repository<User>>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        find: jest.fn(),
                        findOneBy: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                        delete: jest.fn(),
                        merge: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        repo = module.get(getRepositoryToken(User));
    });

    test("Service should be defined", () => {
        expect(service).toBeDefined();
    })

    test("findAll() should return an array of users", async() => {
        repo.find.mockResolvedValue([mockUser as User]);
        const result = await service.findAll();
        expect(result).toEqual([mockUser]);
        expect(repo.find).toHaveBeenCalled();
    });

    test("findOne() should return a user by id", async() => {
        repo.findOneBy.mockResolvedValue(mockUser as User);
        const result = await service.findOne("b1c4a89e-4905-5e3c-b57f-dc92627d011e");
        expect(result).toEqual(mockUser);
        expect(repo.findOneBy).toHaveBeenCalledWith({ id: "b1c4a89e-4905-5e3c-b57f-dc92627d011e" });
    });

    test("findOne() should throw NotFoundException if user not found", async() => {
        repo.findOneBy.mockResolvedValue(null);
        await expect(service.findOne("123")).rejects.toThrow(NotFoundException);
    });

    test("create() should create and save a user", async() => {
        repo.create.mockReturnValue(mockUser as User);
        repo.save.mockResolvedValue(mockUser as User);
        const result = await service.create({ id: "b1c4a89e-4905-5e3c-b57f-dc92627d011e", firstname: "John", lastname: "Doe", email: "test@example.com", password: "password", dateOfBirth: new Date("2000-01-01"), profilePicture: "none", role: Role.ADMIN })
        expect(result).toEqual(mockUser);
        expect(repo.create).toHaveBeenCalled();
        expect(repo.save).toHaveBeenCalled();
    });

    test("create() should throw ConflictException if email or id already exist", async() => {
        const new_user: CreateUserDTO = {
            "id": "jdz56q3f-sdz5-56da-daza256s2qa1",
            "firstname": "Jane",
            "lastname": "Doh",
            "email": "test@example.com",
            "password": "password123",
            "dateOfBirth": new Date("2010-12-12"),
            "profilePicture": "none",
            "role": Role.USER
        };

        jest.spyOn(repo, "save").mockRejectedValue({
            code: "23505",
        });

        await expect(service.create(new_user)).rejects.toThrow(ConflictException);
    })

    test("create() should throw unknow error", async() => {
        const new_user: CreateUserDTO = {
            "id": "jdz56q3f-sdz5-56da-daza256s2qa1",
            "firstname": "Jane",
            "lastname": "Doh",
            "email": "error@example.com",
            "password": "password123",
            "dateOfBirth": new Date("2010-01-01"),
            "profilePicture": "none",
            "role": Role.USER
        };
        const unknow_error = new Error("Error");

        jest.spyOn(repo, "save").mockRejectedValue(unknow_error);
        await expect(service.create(new_user)).rejects.toThrow("Error");
    })

    test("update() should update and return the user", async() => {
        const updatedUser = { ...mockUser, firstname: "Jane" };

        repo.findOneBy.mockResolvedValue(mockUser as User);
        repo.merge.mockReturnValue(updatedUser as User);
        repo.save.mockResolvedValue(updatedUser as User);

        const result = await service.update("b1c4a89e-4905-5e3c-b57f-dc92627d011e", { firstname: "Jane" });

        expect(repo.findOneBy).toHaveBeenCalledWith({ id: "b1c4a89e-4905-5e3c-b57f-dc92627d011e" });
        expect(repo.merge).toHaveBeenCalledWith(mockUser, { firstname: "Jane" });
        expect(repo.save).toHaveBeenCalledWith(updatedUser);
        expect(result).toEqual(updatedUser);
    })

    test("update() should throw NotFoundException if user does not exist", async() => {
        repo.findOneBy.mockResolvedValue(null);
        await expect(service.update("123", { firstname: "BadTest" })).rejects.toThrow(NotFoundException);
    })

    test("remove() should delete a user", async() => {
        repo.delete.mockResolvedValue({ affected: 1, raw: {} });
        await service.remove("b1c4a89e-4905-5e3c-b57f-dc92627d011e");
        expect(repo.delete).toHaveBeenCalledWith("b1c4a89e-4905-5e3c-b57f-dc92627d011e");
    });

    test("remove() should throw NotFoundException if user not found", async() => {
        repo.delete.mockResolvedValue({ affected: 0, raw: {} });
        await expect(service.remove("123")).rejects.toThrow(NotFoundException);
    })
})
