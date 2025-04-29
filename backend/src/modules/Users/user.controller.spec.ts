import { Test } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { Role, User } from "./entities/user.entity";
import { CreateUserDTO } from "./dto/create-user.dto";

describe("UserController", () => {
    let userController: UserController;
    let userService: UserService;

    beforeEach(async() => {
        const moduleRef = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: {
                        create: jest.fn().mockResolvedValue({
                            id: "jd8hze31-di8t-280o-jz91m5nwg85t",
                            firstname: "Jane",
                            lastname: "Doe",
                            password: "password123",
                            email: "test@example.com",
                            dateOfBirth: new Date("2010-12-12"),
                            role: Role.USER,
                            profilePicture: "none"
                          }),
                    },
                },
            ],
        }).compile();

        userController = moduleRef.get<UserController>(UserController);
        userService = moduleRef.get<UserService>(UserService);
    });

    describe("Create", () => {
        test("should create a new user", async() => {
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

            const expectedUser = {
                ...new_user,
                id: "jd8hze31-di8t-280o-jz91m5nwg85t",
                email: "test@example.com"
            };

            await expect(userController.create(new_user)).resolves.toEqual(expectedUser);
        })
    })
})
