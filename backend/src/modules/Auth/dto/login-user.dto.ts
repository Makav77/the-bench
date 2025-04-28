import { IsEmail, IsNotEmpty, IsString, IsBoolean } from "class-validator";

export class LoginUserDTO {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsBoolean()
    rememberMe: boolean;
}
