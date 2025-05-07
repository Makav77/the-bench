import apiClient from "./apiClient";

export interface PostSummary {
    id: string;
    title: string;
    updatedAt: string;
    author: { id: string; firstname: string; lastname: string; };
}

export interface PostDetails extends PostSummary {
    description: string;
    createdAt: string;
}

export const getPosts = async (page = 1, limit = 10): Promise<{ data: PostSummary[]; total: number; page: number; lastPage: number }> => {
    const response = await apiClient.get("/posts", { params: { page, limit } });
    return response.data;
}

export const getPost = async (id: string): Promise<PostDetails> => {
    const response = await apiClient.get(`/posts/${id}`);
    return response.data;
}

export const createPost = async (data: { title: string; description: string; }): Promise<PostDetails> => {
    const response = await apiClient.post("/posts", data);
    return response.data;
}

export const updatePost = async (id: string, data: { title?: string; description?: string; }) => {
    const response = await apiClient.patch(`/posts/${id}`, data);
    return response.data;
}

export const deletePost = async (id: string): Promise<void> => {
    await apiClient.delete(`/posts/${id}`);
}
