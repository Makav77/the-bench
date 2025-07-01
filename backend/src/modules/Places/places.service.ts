import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { map } from "rxjs/operators";

export interface Place {
    place_id: string;
    name: string;
    vicinity: string;
    geometry: { location: { lat: number; lng: number } };
}

export interface PlaceDetails {
    place_id: string;
    name: string;
    formatted_address: string;
    formatted_phone_number?: string;
    website?: string;
    opening_hours?: { weekday_text: string[] };
    rating?: number;
    user_ratings_total?: number;
    geometry: { location: { lat: number; lng: number } };
}

@Injectable()
export class PlacesService {
    private readonly apiKey = process.env.GOOGLE_PLACES_API_KEY ?? "";

    constructor(private readonly httpService: HttpService) {
        if (!this.apiKey) {
            console.error("GOOGLE_PLACES_API_KEY not set");
        }
    }

    async search(query: string, lat: number, lng: number, radius: number): Promise<Place[]> {
        const url = "https://maps.googleapis.com/maps/api/place/textsearch/json";
        try {
            const response = this.httpService.get(
                url, {
                    params: {
                        key: this.apiKey,
                        query,
                        location: `${lat},${lng}`,
                        radius: radius.toString(),
                        language: "en",
                    },
                })
                .pipe(map(r => r.data.results as Place[]));
            return await firstValueFrom(response);
        } catch (error) {
            console.error("Google Places search error:", error);
            throw new InternalServerErrorException("Places lookup failed");
        }
    }

    async getDetails(placeId: string): Promise<PlaceDetails> {
        const url = "https://maps.googleapis.com/maps/api/place/details/json";
        try {
            const fields = [
                "place_id",
                "name",
                "formatted_address",
                "formatted_phone_number",
                "website",
                "opening_hours",
                "rating",
                "user_ratings_total",
                "geometry"
            ].join(",");
            const response = this.httpService.get(
                url, {
                    params: {
                        key: this.apiKey,
                        place_id: placeId,
                        language: "en",
                        fields
                    },
                })
                .pipe(map(r => (r.data.result as PlaceDetails)));
            return await firstValueFrom(response);
        } catch (error) {
            console.error("Google Places details error:", error);
            throw new InternalServerErrorException("Place details lookup failed");
        }
    }
}
