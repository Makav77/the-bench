import apiClient from "./apiClient";

export interface ChatMessage {
  content: string;
  userId: string;
  username: string;
}

export const getRoomMessages = async (roomId: string): Promise<ChatMessage[]> => {
  const response = await apiClient.get(`/chat/messages/${roomId}`);
  return response.data.map((msg: any) => ({
    content: msg.content,
    userId: msg.sender.id,
    username: `${msg.sender.firstname} ${msg.sender.lastname}`,
  }));
};
