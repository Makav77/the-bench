import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateFlashPostDTO {
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
