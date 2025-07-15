import { IsOptional, IsString, MaxLength } from "class-validator";

export class SubmitCompletionDTO {
    @IsOptional()
    @IsString()
    @MaxLength(300)
    imageUrl?: string;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    text?: string;
}
