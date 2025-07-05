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
