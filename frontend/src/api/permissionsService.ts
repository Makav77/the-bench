import apiClient from "./apiClient";

export interface RestrictResponse {
    id: string;
    user: { id: string };
    permission: { code: string };
    reason: string;
    expiresAt: string;
}

export interface IsRestrictedResponse {
    restricted: boolean;
    expiresAt: string | null;
    reason: string | null;
}

export async function isRestricted(code: string): Promise<IsRestrictedResponse> {
    const response = await apiClient.get(`/permissions/${code}/isRestricted`);
    return response.data;
}

export async function restrictUser(code: string, reason: string, userId: string, days?: number, hours?: number, minutes?: number): Promise<RestrictResponse> {
    const response = await apiClient.post(`/permissions/${code}/restrict`, {
        userId,
        reason,
        days,
        hours,
        minutes,
    });
    return response.data;
}
