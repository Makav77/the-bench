import apiClient from "./apiClient";

export async function getCitiesByPostalCode(postalCode: string): Promise<string[]> {
    const response = await apiClient.get("/iris/cities", {
        params: { postalCode }
    });

    return response.data;
}

export async function resolveIris(street: string, postalCode: string, city: string): Promise<{ irisCode: string; irisName: string }> {
    const response = await apiClient.post("/iris/resolve", {
        street,
        postalCode,
        city
    });

    return response.data;
}
