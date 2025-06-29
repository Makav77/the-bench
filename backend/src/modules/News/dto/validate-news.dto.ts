import { IsBoolean, ValidateIf, IsString, MaxLength } from "class-validator";

export class ValidateNewsDTO {
    @IsBoolean()
    validated: boolean;

    @ValidateIf(o => o.validated === false)
    @IsString()
    @MaxLength(1000)
    rejectedReason?: string;
}
