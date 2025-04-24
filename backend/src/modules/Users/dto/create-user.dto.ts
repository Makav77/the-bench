import { IsEmail, IsEnum, IsNotEmpty, IsString, IsDateString } from "class-validator";
import { Role } from "../entities/user.entity";

export class CreateUserDTO {
    @IsNotEmpty()
    @IsString()
    id: string;

    @IsNotEmpty()
    @IsString()
    firstname: string;

    @IsNotEmpty()
    @IsString()
    lastname: string

    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsDateString()
    dateOfBirth: string;

    @IsNotEmpty()
    @IsString()
    profilePicture: string;

    @IsEnum(Role)
    role: Role;
}
