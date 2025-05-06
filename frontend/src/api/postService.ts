import apiClient from "./apiClient";

export interface PostSummary {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    author: { id: string; firstname: string; lastname: string, role: string };
}
