import apiClient from "./apiClient";
import { GalleryFormData } from "../components/Gallery/GalleryForm";

export interface GalleryItemSummary {
    id: string;
    url: string;
    description?: string;
    author: { id: string; firstname: string; lastname: string };
    likesCount: number;
    createdAt: string;
}

export const getGalleryItems = async (page = 1, limit = 30): Promise<{ data: GalleryItemSummary[]; total: number; page: number; lastPage: number }> => {
    const res = await apiClient.get("/gallery", { params: { page, limit } });
    return res.data;
}

export const getGalleryItem = async (id: string): Promise<GalleryItemSummary> => {
    const response = await apiClient.get(`/gallery/${id}`);
    return response.data;
}

export const createGalleryItem = async (galleryFormData: GalleryFormData): Promise<GalleryItemSummary> => {
    const response = await apiClient.post("/gallery", galleryFormData);
    return response.data;
}

export const likeGalleryItem = async (id: string): Promise<GalleryItemSummary> => {
    const response = await apiClient.post(`/gallery/${id}/like`);
    return response.data;
}

export const unkineGalleryItem = async(id: string): Promise<GalleryItemSummary> => {
    const response = await apiClient.delete(`/gallery/${id}/like`);
    return response.data;
}

export const removeGalleryItem = async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/gallery/${id}`);
    return response.data;
}
