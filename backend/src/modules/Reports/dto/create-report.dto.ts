import { IsNotEmpty, IsString, IsUUID, IsOptional } from "class-validator";

export class CreateReportDTO {
    @IsUUID()
    @IsNotEmpty()
    reportedUserId: string;

    @IsString()
    @IsNotEmpty()
    reason: string;

    @IsString()
    @IsOptional()
    description?: string;
}
