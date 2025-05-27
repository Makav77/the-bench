import { IsBoolean } from "class-validator";

export class ValidateCompletionDTO {
    @IsBoolean()
    validated: boolean;
}
