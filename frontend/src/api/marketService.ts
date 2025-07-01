import apiClient from "./apiClient";
import { ItemFormData } from "../components/Market/ItemForm";

export interface MarketItemSummary {
    id: string;
    title: string;
    price?: number;
    updatedAt: string;
    images?: string[];
    author: { id: string; firstname: string; lastname: string; role: string; };
}

export interface MarketItemDetails extends MarketItemSummary {
    description: string;
    createdAt: string;
    contactEmail?: string;
    contactPhone?: string;
}

function toFormData(data: ItemFormData): FormData {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    if (data.price != null && !isNaN(Number(data.price))) {
        formData.append("price", data.price.toString());
    }
    data.images?.forEach((file) => {
        formData.append("images", file);
    });
    if (data.contactEmail) {
        formData.append("contactEmail", data.contactEmail);
    }
    if (data.contactPhone) {
        formData.append("contactPhone", data.contactPhone);
    }
    return formData;
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
    const formData = toFormData(data);
    const response = await apiClient.post("/market", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
}

export const updateItem = async (id: string, data: ItemFormData): Promise<MarketItemDetails> => {
    const formData = toFormData(data);
    const response = await apiClient.patch(`/market/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
}

export const deleteItem = async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/market/${id}`);
    return response.data;
}
