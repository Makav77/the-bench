import { IsString, IsNotEmpty, IsDateString, IsOptional, IsInt, Min, MaxLength, Max } from "class-validator";

export class CreateEventDTO {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    place: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    maxNumberOfParticipants?: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(5000)
    description: string;
}
