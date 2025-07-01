import { IsIn, IsNotEmpty } from "class-validator";

export class UpdateReportStatusDTO {
    @IsNotEmpty()
    @IsIn(["PENDING", "VALIDATED", "REJECTED"])
    status: "PENDING" | "VALIDATED" | "REJECTED";
}
