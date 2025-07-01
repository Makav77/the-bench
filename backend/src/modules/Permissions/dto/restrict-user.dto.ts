import { IsUUID, IsNotEmpty, isString, IsInt, Min, Max, ValidateIf, IsString, IsIn } from "class-validator";

export class RestrictUserDTO {
    @IsUUID("4")
    userId: string;

    @IsNotEmpty()
    @IsString()
    reason: string;

    @ValidateIf(o => o.days !== undefined)
    @IsInt()
    @Min(0)
    days?: number;

    @ValidateIf(o => o.hours !== undefined)
    @IsInt()
    @Min(0)
    @Max(23)
    hours?: number;

    @ValidateIf(o => o.minutes !== undefined)
    @IsInt()
    @Min(0)
    @Max(59)
    minutes?: number;
}
