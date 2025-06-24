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
    totalLikes: number;
}

export interface NewsPaginationDTO {
    data: NewsDTO[];
    total: number;
    page: number;
    lastPage: number;
}

export interface NewsLikesDTO {
    totalLikes: number;
    liked: boolean;
}

export interface ValidateNewsDTO {
    validated: boolean;
    rejectionReason?: string;
}

export interface NewsSummary {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    authorId: string;
    authorFirstname: string;
    authorLastname: string;
    authorProfilePicture?: string;
}

export const getAllNews = async (page = 1, limit = 5): Promise<NewsPaginationDTO> => {
    const response = await apiClient.get("/news", { params: { page, limit } });
    return response.data;
}

export const getOneNews = async (id: string): Promise<NewsDTO> => {
    const response = await apiClient.get(`/news/${id}`);
    return response.data;
}

export const createNews = async (news: { title: string; content: string; images: string[]; tags?: string[]; published?: boolean; authorId: string; }): Promise<NewsDTO> => {
    const response = await apiClient.post("/news", news);
    return response.data;
}

export const updateNews = async (id: string, news: { title: string; content: string; images: string[]; tags?: string[]; published?: boolean }): Promise<NewsDTO> => {
    const response = await apiClient.patch(`news/${id}`, news);
    return response.data;
}

export const deleteNews = async (id: string): Promise<void> => {
    await apiClient.delete(`/news/${id}`);
}

export const uploadNewsImages = async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    const response = await apiClient.post("/news/upload-images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
    });
    return response.data.urls;
}

export const toggleNewsLike = async (id: string): Promise<NewsLikesDTO> => {
    const response = await apiClient.post(`/news/${id}/like`);
    return response.data;
};

export const getNewsLikes = async (id: string): Promise<NewsLikesDTO> => {
    const response = await apiClient.get(`/news/${id}/likes`);
    return response.data;
};

export const getPendingNews = async (page = 1, limit = 5): Promise<{ data: NewsSummary[]; lastPage: number }> => {
    const res = await apiClient.get(`/news/pending?page=${page}&limit=${limit}`);
    return res.data;
};

export const validateNews = async (id: string, dto: ValidateNewsDTO): Promise<NewsSummary> => {
    const res = await apiClient.patch(`/news/${id}/validate`, dto);
    return res.data;
};
