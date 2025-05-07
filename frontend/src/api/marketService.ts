import apiClient from "./apiClient";

export interface MarketItemSummary {
    id: string;
    title: string;
    price?: number;
    updatedAt: string;
    author: { id: string; firstname: string; lastname: string; role: string; };
}

export interface MarketItemDetails extends MarketItemSummary {
    description: string;
    createdAt: string;
    images?: string[];
    contactEmail?: string;
    contactPhone?: string;
}

export const getItems = async (page = 1, limit = 10): Promise<{ data: MarketItemSummary[]; total: number; page: number; lastPage: number; }> => {
    const response = await apiClient.get("/market", { params: { page, limit } });
    return response.data;
}

export const getItem = async (id: string): Promise<MarketItemDetails> => {
    const response = await apiClient.get(`/market/${id}`);
    return response.data;
}

export const createItem = async (data: ItemFormData): Promise<MarketItemDetails> => {
    const response = await apiClient.post("/market", data, {
        headers: { "Content-Type": "multipart/form-data "},
    });
    return response.data;
}

export const updateItem = async (id: string, data: ItemFormData): Promise<MarketItemDetails> => {
    const response = await apiClient.patch(`/market/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data "},
    });
    return response.data;
}

export const deleteItem = async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/market/${id}`);
    return response.data;
}
