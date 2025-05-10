import { IsOptional, IsString } from "class-validator";

export class CreateGalleryItemDTO {
    @IsOptional()
    @IsString()
    description?: string;
}
