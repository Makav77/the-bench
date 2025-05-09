import { IsNotEmpty, IsString } from "class-validator";

export class CreateFlashPostDTO {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;
}
