import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./entities/user.entity";
import { UpdateUserDTO } from "./dto/update-user.dto";
import { CreateUserDTO } from "./dto/create-user.dto";

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    async findAll(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Get(":id")
    async findOne(@Param("id") id: string): Promise<User> {
        return this.userService.findOne(id);
    }

    @Post()
    create(@Body() createUserDTO: CreateUserDTO): Promise<User> {
        return this.userService.create(createUserDTO);
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() updateUserDTO: UpdateUserDTO): Promise <User> {
        return this.userService.update(id, updateUserDTO);
    }

    @Delete(":id")
    remove(@Param("id") id: string): Promise<void> {
        return this.userService.remove(id);
    }
}
