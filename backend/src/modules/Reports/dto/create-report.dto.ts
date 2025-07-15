import { IsNotEmpty, IsString, IsUUID, IsOptional } from "class-validator";

export class CreateReportDTO {
    @IsUUID()
    @IsNotEmpty()
    reportedUserId: string;

    @IsString()
    @IsNotEmpty()
    reason: string;

    @IsString()
    @IsNotEmpty()
    reportedContentId: string;

    @IsString()
    @IsNotEmpty()
    reportedContentType: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsOptional()
    @IsString()
    irisCode?: string;

    @IsOptional()
    @IsString()
    irisName?: string;
}
