import { IsEmail, IsEnum, IsNotEmpty, IsString, IsDateString, IsOptional } from "class-validator";
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

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsOptional()
    @IsString()
    irisCode?: string;

    @IsOptional()
    @IsString()
    irisName?: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsDateString()
    dateOfBirth: Date;

    @IsString()
    profilePicture: string;

    @IsEnum(Role)
    role: Role;
}
