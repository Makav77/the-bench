import { IsOptional, IsString, IsNotEmpty, MaxLength } from "class-validator";

export class CreateGalleryItemDTO {
    @IsNotEmpty()
    @IsString()
    url: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    description?: string;
}
