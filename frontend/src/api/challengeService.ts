import apiClient from "./apiClient";

export interface ChallengeSummary {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    successCriteria: string;
    status: string;
    rejectedReason?: string | null;
    reviewedAt: string | null;
    author: { id: string; firstname: string; lastname: string; };
    registrations: {
        id: string;
        createdAt: string;
        user: {
            id: string;
            firstname: string;
            lastname: string;
        };
    }[];
    completions: { id: string; user: { id: string }; validated: boolean }[];
}

export interface SubmitCompletionPayload {
    text?: string;
    imageUrl?: string;
}

export interface ValidateCompletionPayload {
    validated: boolean;
    rejectionReason?: string;
}

export interface PendingCompletion {
    id: string;
    text?: string;
    imageUrl?: string;
    validated: boolean;
    createdAt: string;
    reviewedAt?: string | null;
    user: { id: string; firstname: string; lastname: string };
    challenge: { id: string; title: string };
    rejectionReason?: string | null;
}

export const getChallenges = async (page = 1, limit = 10): Promise<{ data: ChallengeSummary[]; total: number; page: number; lastPage: number; }> => {
    const response = await apiClient.get("/challenges", { params: { page, limit } });
    return response.data;
}

export const getChallenge = async (id: string): Promise<ChallengeSummary> => {
    const response = await apiClient.get(`/challenges/${id}`);
    return response.data;
}

export const getPendingChallenges = async (page = 1, limit = 5): Promise<{ data: ChallengeSummary[]; total: number; page: number; lastPage: number; }> => {
    const response = await apiClient.get("/challenges/pending", { params: { page, limit } });
    return response.data;
}

export const getPendingCompletions = async (page = 1, limit = 5): Promise<{ data: PendingCompletion[]; total: number; page: number; lastPage: number; }> => {
    const response = await apiClient.get("/challenges/completions/pending", { params: { page, limit } });
    return response.data;
}

export const createChallenge = async (payload: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    successCriteria: string;
}): Promise<ChallengeSummary> => {
    const response = await apiClient.post("/challenges", payload);
    return response.data;
}

export const updateChallenge = async (id: string, payload: { 
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    successCriteria: string;
}): Promise<ChallengeSummary> => {
    const response = await apiClient.patch(`/challenges/${id}`, payload);
    return response.data;
}

export const deleteChallenge = async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/challenges/${id}`);
    return response.data;
}

export const subscribeChallenge = async (id: string): Promise<ChallengeSummary> => {
    const response = await apiClient.post(`/challenges/${id}/subscribe`);
    return response.data;
}

export const unsubscribeChallenge = async (id: string): Promise<ChallengeSummary> => {
    const response = await apiClient.delete(`/challenges/${id}/subscribe`);
    return response.data;
}

export const submitCompletion = async (id: string, payload: SubmitCompletionPayload): Promise<ChallengeSummary> => {
    const response = await apiClient.post(`/challenges/${id}/complete`, payload);
    return response.data;
}

export const validateChallenge = async (id: string, payload: { validated: boolean; rejectionReason?: string }): Promise<ChallengeSummary> => {
    const response = await apiClient.patch(`/challenges/${id}/validate`, payload);
    return response.data;
}

export const validateCompletion = async (challengeId: string, completionId: string, payload: ValidateCompletionPayload): Promise<PendingCompletion> => {
    const response = await apiClient.patch(`/challenges/${challengeId}/complete/${completionId}`, payload);
    return response.data;
}
