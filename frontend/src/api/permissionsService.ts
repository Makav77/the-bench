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

export const DEFAULT_PERMISSIONS = [
    { code: "publish_post", description: "Post an announcement" },
    { code: "publish_flash_post", description: "Post a flash announcement" },
    { code: "create_event", description: "Create an event" },
    { code: "register_event", description: "Register for an event" },
    { code: "publish_gallery", description: "Post an image to the gallery" },
    { code: "create_poll", description: "Create a survey" },
    { code: "vote_poll", description: "Vote a survey" },
    { code: "create_challenge", description: "Create a challenge" },
    { code: "register_challenge", description: "Register for a challenge" },
    { code: "send_report", description: "Send a report" },
    { code: "create_news", description: "Create news" },
];

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
