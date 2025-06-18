import apiClient from "./apiClient";

export interface NewsDTO {
    id: string;
    title: string;
    content: string;
    images: string[];
    tags?: string[];
    published?: boolean;
    authorId: string;
    createdAt: string;
    updatedAt: string;
}

export interface NewsPaginationDTO {
    data: NewsDTO[];
    total: number;
    page: number;
    lastPage: number;
}

export const getAllNews = async (page = 1, limit = 5): Promise<NewsPaginationDTO> => {
    const response = await apiClient.get("/news", { params: { page, limit } });
    return response.data;
}

export const getOneNews = async (id: string): Promise<NewsDTO> => {
    const response = await apiClient.get(`/news/${id}`);
    return response.data;
}

export const createNews = async (news: { title: string; content: string; images: string[]; tags?: string[]; published?: boolean; }): Promise<NewsDTO> => {
    const response = await apiClient.post("/news", news);
    return response.data;
}

export const deleteNews = async (id: string): Promise<void> => {
    await apiClient.delete(`/news/${id}`);
}
