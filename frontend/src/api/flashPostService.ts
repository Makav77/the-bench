import apiClient from "./apiClient";


export interface FlashPostSummary {
    id: string;
    title: string;
    updatedAt: string;
    author: { id: string; firstname: string; lastname: string; role: string; };
}

export interface FlashPostDetails extends FlashPostSummary {
    description: string;
    createdAt: string;
}

export const getFlashPosts = async (page = 1, limit = 5): Promise<{ data: FlashPostSummary[]; total: number; page: number; lastPage: number; }> => {
    const response = await apiClient.get("/flashposts", { params: { page, limit } });
    return response.data;
}

export const getFlashPost = async (id: string): Promise<FlashPostDetails> => {
    const response = await apiClient.get(`/flashposts/${id}`);
    return response.data;
}

export const createFlashPost = async (data: { title: string; description: string; }): Promise<FlashPostDetails> => {
    const response = await apiClient.post("/flashposts", data);
    return response.data;
}

export const updateFlashPost = async (id: string, data: { title?: string; description?: string; }): Promise<FlashPostDetails> => {
    const response = await apiClient.patch(`/flashposts/${id}`, data);
    return response.data;
}

export const deleteFlashPost = async (id: string): Promise<void> => {
    await apiClient.delete(`/posts/${id}`);
}
