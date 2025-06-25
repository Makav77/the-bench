import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEmail, IsArray, ArrayNotEmpty, ArrayUnique, IsPhoneNumber, MaxLength } from "class-validator";

export class CreateMarketItemDTO {
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsOptional()
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
    @IsPhoneNumber(undefined)
    contactPhone?: string;

    @IsOptional()
    @IsString()
    irisCode?: string;

    @IsOptional()
    @IsString()
    irisName?: string;
}
