import apiClient from "./apiClient";

export interface FriendDTO {
    id: string;
    firstname: string;
    lastname: string;
    profilePicture: string;
}

export const getFriends = async (userId: string): Promise<FriendDTO[]> => {
    const response = await apiClient.get(`/users/${userId}/friends`);
    return response.data;
}

export const sendFriendRequest = async (targetUserId: string): Promise<void> => {
    await apiClient.post(`/users/${targetUserId}/friend-request`);
}

export const acceptFriendRequest = async (requesterId: string): Promise<void> => {
    await apiClient.post(`/users/${requesterId}/accept-friend`);
}

export const rejectFriendRequest = async (senderId: string): Promise<void> => {
    await apiClient.delete(`/users/${senderId}/reject-friend`);
}

export const removeFriend = async (friendId: string): Promise<void> => {
    await apiClient.delete(`/users/${friendId}/remove-friend`);
}

export const getPendingFriendRequests = async (userId: string): Promise<FriendDTO[]> => {
    const response = await apiClient.get(`users/${userId}/pending-friend-requests`);
    return response.data;
}

export const cancelFriendRequest = async (targetUserId: string): Promise<void> => {
    await apiClient.delete(`/users/${targetUserId}/cancel-friend-request`);
}
