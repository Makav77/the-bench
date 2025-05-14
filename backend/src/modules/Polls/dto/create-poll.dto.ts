import { IsNotEmpty, IsString, IsArray, ArrayMinSize, ArrayMaxSize, ArrayUnique, IsEnum, IsOptional, IsInt, Min } from "class-validator";

export enum PollType {
    SINGLE = "single",
    MULTIPLE = "multiple",
    LIMITED = "limited",
}

export class CreatePollDTO {
    @IsNotEmpty()
    @IsString()
    question: string;

    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(10)
    @ArrayUnique()
    @IsString({ each: true })
    options: string[];

    @IsEnum(PollType)
    type: PollType;

    @IsOptional()
    @IsInt()
    @Min(1)
    maxSelections?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    autoCloseIn?: number;
}