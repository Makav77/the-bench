import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEmail, IsArray, ArrayNotEmpty, ArrayUnique, IsPhoneNumber, MaxLength, Matches } from "class-validator";

export class CreateMarketItemDTO {
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    price?: number;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @ArrayUnique()
    @IsString({ each: true })
    images?: string[];

    @IsOptional()
    @IsEmail()
    contactEmail?: string;

    @IsOptional()
    @Matches(/^(\+33|0)[1-9]\d{8}$/, { message: "contactPhone must be a valid French phone number" })
    contactPhone?: string;

    @IsOptional()
    @IsString()
    irisCode?: string;

    @IsOptional()
    @IsString()
    irisName?: string;
}
