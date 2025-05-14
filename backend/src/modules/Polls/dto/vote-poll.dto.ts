import { IsArray, IsInt, Min, ArrayMinSize, ArrayMaxSize, IsOptional } from "class-validator";

export class VotePollDTO {
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(10)
    @IsInt({ each: true })
    @Min(1, { each: true })
    selectedOptionsIds: number[];
}