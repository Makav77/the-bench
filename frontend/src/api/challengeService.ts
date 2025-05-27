import apiClient from "./apiClient";

export interface ChallengeSummary {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    successCriteria: string;
    author: { id: string; firstname: string; lastname: string; };
    registrations: { user: { id: string } }[];
    completions: { id: string; user: { id: string }; validated: boolean }[];
}

export interface SubmitCompletionPayload {
    text?: string;
    imageUrl?: string;
}

export interface ValidateCompletionPayload {
    validated: boolean;
}

export const getChallenges = async (page = 1, limit = 10): Promise<{ data: ChallengeSummary[]; total: number; page: number; lastPage: number; }> => {
    const response = await apiClient.get("/challenges", { params: { page, limit } });
    return response.data;
}

export const getChallenge = async (id: string): Promise<ChallengeSummary> => {
    const response = await apiClient.get(`/challenges/${id}`);
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

export const validateCompletion = async (challengeId: string, completionId: string, payload: ValidateCompletionPayload): Promise<ChallengeSummary> => {
    const response = await apiClient.patch(`/challenges/${challengeId}/complete/${completionId}`, payload);
    return response.data;
}
