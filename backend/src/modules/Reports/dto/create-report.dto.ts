import { isNotEmpty, IsString, IsUUID, IsOptional, IsNotEmpty } from "class-validator";

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
