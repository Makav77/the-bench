import { Test } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { Role, User } from "./entities/user.entity";
import { CreateUserDTO } from "./dto/create-user.dto";
import { UpdateUserDTO } from "./dto/update-user.dto";

describe("UserController", () => {
    let userController: UserController;
    let userService: UserService;

    const mockUser: User = {
        id: "jd8hze31-di8t-280o-jz91m5nwg85t",
        firstname: "Jane",
        lastname: "Doe",
        password: "password123",
        email: "test@example.com",
        dateOfBirth: new Date("2010-12-12"),
        role: Role.USER,
        profilePicture: "none"
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: {
                        create: jest.fn().mockResolvedValue(mockUser),
                        findAll: jest.fn().mockResolvedValue([mockUser]),
                        findOne: jest.fn().mockResolvedValue(mockUser),
                        update: jest.fn().mockResolvedValue({ ...mockUser, email: "updated@example.com" }),
                        remove: jest.fn().mockResolvedValue(undefined),
                    },
                },
            ],
        }).compile();

        userController = moduleRef.get<UserController>(UserController);
        userService = moduleRef.get<UserService>(UserService);
    });

    describe("Create", () => {
        test("should create a new user", async () => {
            const new_user: CreateUserDTO = {
                id: "",
                firstname: "Jane",
                lastname: "Doe",
                email: "test@example.com",
                password: "password123",
                dateOfBirth: new Date("2010-12-12"),
                profilePicture: "none",
                role: Role.USER,
            };

            await expect(userController.create(new_user)).resolves.toEqual(mockUser);
        });
    });

    describe("findAll", () => {
        test("should return an array of users", async () => {
            await expect(userController.findAll()).resolves.toEqual([mockUser]);
        });
    });

    describe("findOne", () => {
        test("should return a user by id", async () => {
            await expect(userController.findOne("jd8hze31-di8t-280o-jz91m5nwg85t")).resolves.toEqual(mockUser);
        });
    });

    describe("update", () => {
        test("should update a user and return it", async () => {
            const updateUserDTO: UpdateUserDTO = {
                email: "updated@example.com"
            };

            const updatedUser = { ...mockUser, email: "updated@example.com" };
            await expect(userController.update(mockUser.id, updateUserDTO)).resolves.toEqual(updatedUser);
        });
    });

    describe("remove", () => {
        test("should delete the user", async () => {
            await expect(userController.remove(mockUser.id)).resolves.toBeUndefined();
        });
    });
})
