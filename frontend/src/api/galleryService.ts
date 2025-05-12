import apiClient from "./apiClient";

export interface GalleryItemSummary {
    id: string;
    url: string;
    description?: string;
    author: { id: string; firstname: string; lastname: string; };
    likedBy: { id: string }[];
    createdAt: string;
}

export const getGalleryItems = async (page = 1, limit = 30): Promise<{ data: GalleryItemSummary[]; total: number; page: number; lastPage: number }> => {
    const response = await apiClient.get("/gallery", { params: { page, limit } });
    return response.data;
}

export const getGalleryItem = async (id: string): Promise<GalleryItemSummary> => {
    const response = await apiClient.get(`/gallery/${id}`);
    return response.data;
}

export const createGalleryItem = async (file: File, description?: string): Promise<GalleryItemSummary> => {
    const formData = new FormData();
    formData.append("url", file);
    if (description) {
        formData.append("description", description);
    }
    const response = await apiClient.post("/gallery", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
}

export const deleteGalleryItem = async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/gallery/${id}`);
    return response.data;
}

export const toggleLikeGalleryItem = async (id: string): Promise<GalleryItemSummary> => {
    const response = await apiClient.post(`/gallery/${id}/like`);
    return response.data;
}
