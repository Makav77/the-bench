import apiClient from "./apiClient";

export const sendHangmanInvite = async (recipientId: string) => {
    const res = await apiClient.post(`/hangman/invite/send/${recipientId}`);
    return res.data;
};

export const getPendingHangmanInvites = async () => {
    const response = await apiClient.get("/hangman/invite/pending");
    return response.data;
};

export async function respondToHangmanInvite(inviteId: string, action: "accepted" | "declined") {
  const response = await apiClient.post(`/hangman/invite/${inviteId}/${action}`);
  return response.data;
}

export const getInviteById = async (inviteId: string) => {
    const response = await apiClient.get(`/hangman/invite/${inviteId}`);
    return response.data;
};

export const submitHangmanWord = (inviteId: string, word: string) => {
    return apiClient.patch(`/hangman/invite/${inviteId}/word`, { word });
}

export const cancelHangmanInvite = (inviteId: string) => {
    return apiClient.patch(`/hangman/invite/${inviteId}/cancel`);
};