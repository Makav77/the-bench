import apiClient from "./apiClient";

export interface ChatMessage {
    content: string;
    userId: string;
    username: string;
}

interface GroupCreatePayload {
    name: string;
    members: string[];
}

export const getRoomMessages = async (roomId: string): Promise<ChatMessage[]> => {
    const response = await apiClient.get(`/chat/messages/${roomId}`);
    return response.data.map((msg: any) => ({
        content: msg.content,
        userId: msg.sender.id,
        username: `${msg.sender.firstname} ${msg.sender.lastname}`,
    }));
};

export const createGroup = async (groupData: GroupCreatePayload) => {
    const response = await apiClient.post('/chat/groups', groupData);
    return response.data;
};


export const getGroups = async (userId: string | undefined): Promise<{ id: string; name: string }[]> => {
    const response = await apiClient.get(`/chat/groups/${userId}`);
    return response.data.map((group: any) => ({
        id: group.id,
        name: group.name,
    }));
};

export const leaveGroup = async (groupId: string): Promise<{ deleted: boolean }> => {
    const response = await apiClient.delete(`/chat/groups/${groupId}/leave`);
    return response.data;
};