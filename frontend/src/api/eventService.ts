import api from "./authService";

export interface EventSummary {
    id: string;
    name: string;
    startDate: string;
}

export interface EventDetails extends EventSummary {
    endDate: string;
    createdDate: string;
    updatedDate: string;
    place: string;
    maxNumberOfParticipants?: number;
    description: string;
    author: { id: string; firstname: string; lastname: string };
    participantsList: { id: string }[];
}

export const getEvents = async (page = 1, limit = 5): Promise<{ data: EventSummary[]; total: number; page: number; lastPage: number }> => {
    const response = await api.get("/events", { params: { page, limit } });
    return response.data;
}

export const getEvent = async (id: string): Promise<EventDetails> => {
    const response = await api.get(`/event/${id}`);
    return response.data;
}
