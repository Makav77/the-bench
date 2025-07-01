import { IsBoolean, ValidateIf, IsString, MaxLength } from "class-validator";

export class ValidateCompletionDTO {
    @IsBoolean()
    validated: boolean;

    @ValidateIf(o => o.validated === false)
    @IsString()
    @MaxLength(1000)
    rejectedReason?: string;
}
