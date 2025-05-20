import { IsArray, ArrayMinSize, ArrayMaxSize, IsUUID } from "class-validator";

export class VotePollDTO {
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(10)
    @IsUUID("4", { each: true })
    selectedOptionsIds: string[];
}
