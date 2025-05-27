import { IsString, MaxLength, IsNotEmptyObject, ValidateIf } from "class-validator";

export class SubmitCompletionDTO {
    @ValidateIf(o => !o.text)
    @IsNotEmptyObject({ nullable: true })
    imageUrl?: string;

    @ValidateIf(o => !o.imageUrl)
    @IsString()
    @MaxLength(2000)
    text?: string;
}
