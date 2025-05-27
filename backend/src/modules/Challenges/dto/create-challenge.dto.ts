import { IsNotEmpty, IsString, IsDateString, MaxLength } from "class-validator";

export class CreateChallengeDTO {
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    title: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(10000)
    description: string;

    @IsNotEmpty()
    @IsDateString()
    startDate: string;

    @IsNotEmpty()
    @IsDateString()
    endDate: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(500)
    successCriteria: string;
}
