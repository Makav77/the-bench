import apiClient from "./apiClient";

export interface BadgeDTO  {
    id: string;
    imageUrl: string;
    cost: number;
    available: boolean;
    owned?: boolean;
}

export async function getAllBadgesWithUserInfo(): Promise<BadgeDTO[]> {
    const { data } = await apiClient.get("/shop/badges");
    return data;
}

export async function getUserBadges(): Promise<BadgeDTO[]> {
    const { data } = await apiClient.get("/shop/user-badges");
    return data;
}

export async function buyBadge(badgeId: string): Promise<{ success: boolean }> {
    const { data } = await apiClient.post(`/shop/buy/${badgeId}`);
    return data;
}

export async function createBadge(file: File, cost: number, available: boolean) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("cost", String(cost));
    formData.append("available", String(available));
    const response = await apiClient.post("/shop/badges", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
}

export async function deleteBadge(badgeId: string): Promise<{ success: boolean }> {
    const { data } = await apiClient.delete(`/shop/badges/${badgeId}`);
    return data;
}
