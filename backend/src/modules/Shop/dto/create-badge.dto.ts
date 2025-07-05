import { IsBoolean, IsNumber, IsString } from "class-validator";

export class CreateBadgeDTO {
    @IsString()
    imageUrl: string;

    @IsNumber()
    cost: number;

    @IsBoolean()
    available: boolean;
}
