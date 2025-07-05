import { IsBoolean, IsNumber, IsString } from "class-validator";

export class CreateBadgeDTO {
    @IsNumber()
    cost: number;

    @IsBoolean()
    available: boolean;
}
