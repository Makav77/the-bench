import { Type } from "class-transformer";
import { IsBoolean, IsNumber } from "class-validator";

export class CreateBadgeDTO {
    @IsNumber()
    @Type(() => Number)
    cost: number;

    @IsBoolean()
    @Type(() => Boolean)
    available: boolean;
}
