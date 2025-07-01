import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateCommentDTO {
    @IsString()
    @IsNotEmpty()
    newsId: string;

    @IsString()
    @IsNotEmpty()
    authorId: string;

    @IsString()
    @IsNotEmpty()
    authorName: string;

    @IsString()
    @IsNotEmpty()
    authorAvatar: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsOptional()
    @IsString()
    irisCode?: string;

    @IsOptional()
    @IsString()
    irisName?: string;
}
