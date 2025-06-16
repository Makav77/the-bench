import apiClient from "./apiClient";

export interface PollOption {
    id: string;
    label: string;
    votesCount: number;
}

export interface PollSummary {
    id: string;
    question: string;
    type: "single" | "multiple" | "limited";
    maxSelections?: number;
    closesAt?: string;
    manualClosed: boolean;
    createdAt: string;
    author: { id: string; firstname: string; lastname: string; role: string; };
    votes: { voter: { id: string } }[];
}

export interface PollDetails extends PollSummary {
    options: PollOption[];
}

export const getAllPolls = async (page = 1, limit = 10): Promise<{ data: PollSummary[]; total: number; page: number; lastPage: number }> => {
    const response = await apiClient.get("/polls", { params: { page, limit } });
    return response.data;
}

export const getPoll = async (id: string): Promise<PollDetails> => {
    const response = await apiClient.get(`/polls/${id}`);
    return response.data;
}

export const createPoll = async (form: {
    question: string;
    options: string[];
    type: "single" | "multiple" | "limited";
    maxSelections?: number;
    autoCloseAt?: string;
}): Promise<PollDetails> => {
    const response = await apiClient.post("/polls", form);
    return response.data;
}

export const votePoll = async (id: string, selectedOptionsIds: string[]): Promise<PollDetails> => {
    const response = await apiClient.post(`/polls/${id}/vote`, { selectedOptionsIds });
    return response.data;
}

export const closePoll = async (id: string): Promise<PollDetails> => {
    const response = await apiClient.post(`/polls/${id}/close`, {});
    return response.data;
}

export const deletePoll = async (id: string): Promise<void> => {
    await apiClient.delete(`/polls/${id}`);
}
