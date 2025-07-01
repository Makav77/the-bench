import { Controller, Get, Query, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";
import { PlacesService, PlaceDetails, Place } from "./places.service";

@Controller("places")
export class PlacesController {
    constructor(private placesService: PlacesService) {}

    @UseGuards(JwtAuthGuard)
    @Get("search")
    search(
        @Query("q") q: string,
        @Query("lat") lat: string,
        @Query("lng") lng: string,
        @Query("radius") radius: string,
    ): Promise<Place[]> {
        return this.placesService.search(q, parseFloat(lat), parseFloat(lng), parseInt(radius));
    }

    @Get("details/:placeId")
    getDetails(@Param("placeId") placeId: string): Promise<PlaceDetails> {
        return this.placesService.getDetails(placeId);
    }
}
