import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateGalleryItemDTO {
    @IsOptional()
    @IsString()
    @MaxLength(200)
    description?: string;

    @IsOptional()
    @IsString()
    irisCode?: string;

    @IsOptional()
    @IsString()
    irisName?: string;
}
