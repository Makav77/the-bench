import apiClient from "../../api/apiClient";

export interface PlaceSummary {
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

export async function fetchArtisansByType(job: string, lat: number, lng: number, radius: number): Promise<PlaceSummary[]> {
    const response = await apiClient.get("/places/search", {
        params: { 
            q: job, lat, lng, radius 
        }
    });
    return response.data;
}

export async function fetchPlaceDetails(placeId: string): Promise<PlaceDetails> {
    const response = await apiClient.get(`/places/details/${placeId}`);
    return response.data;
}
