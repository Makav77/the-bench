import { Controller, Get, Query, Post, Body, BadRequestException } from "@nestjs/common";
import { IrisService } from "./iris.service";

@Controller("iris")
export class IrisController {
    constructor(private readonly irisService: IrisService) {}

    @Get("cities")
    async getCitiesByPostalCode(@Query("postalCode") postalCode: string): Promise<string[]> {
        return this.irisService.getCitiesByPostalCode(postalCode);
    }

    @Post("resolve")
    async resolveIris(@Body() body: { street: string; postalCode: string; city: string }): Promise<{ irisCode: string; irisName: string }> {
        const { street, postalCode, city } = body;
        return this.irisService.resolveIris(street, postalCode, city);
    }
}
