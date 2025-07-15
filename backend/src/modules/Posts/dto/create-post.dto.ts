import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePostDTO {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    irisCode?: string;

    @IsOptional()
    @IsString()
    irisName?: string;
}
