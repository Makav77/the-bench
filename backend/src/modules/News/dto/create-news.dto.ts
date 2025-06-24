import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, ArrayNotEmpty, isBoolean } from "class-validator";

export class CreateNewsDTO {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsNotEmpty()
    authorId: string;

    @IsArray()
    @IsOptional()
    tags?: string[];

    @IsBoolean()
    @IsOptional()
    published?: boolean;

    @IsArray()
    @IsOptional()
    images?: string[];
}
