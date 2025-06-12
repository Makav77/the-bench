import apiClient from "./apiClient";
import { EventFormData } from "../components/Events/EventForm";

export interface EventSummary {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    maxNumberOfParticipants?: number;
    author: { id: string; firstname: string; lastname: string };
    participantsList: { id: string }[];
}

export interface EventDetails extends EventSummary {
    createdDate: string;
    updatedDate: string;
    place: string;
    maxNumberOfParticipants?: number;
    description: string;
    author: { id: string; firstname: string; lastname: string };
    participantsList: { id: string; firstname: string; lastname: string; }[];
}

export const getEvents = async (page = 1, limit = 5): Promise<{ data: EventSummary[]; total: number; page: number; lastPage: number }> => {
    const response = await apiClient.get("/events", { params: { page, limit } });
    return response.data;
}

export const getEvent = async (id: string): Promise<EventDetails> => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
}

export const createEvent = async (data: EventFormData): Promise<EventDetails> => {
    const response = await apiClient.post("/events", data);
    return response.data;
}

export const updateEvent = async (id: string, data: EventFormData): Promise<EventDetails> => {
    const response = await apiClient.patch(`/events/${id}`, data);
    return response.data;
}

export const deleteEvent = async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
}

export const subscribeEvent = async (id: string): Promise<EventDetails> => {
    const response = await apiClient.post<EventDetails>(`/events/${id}/subscribe`)
    return response.data;
}

export const unsubscribeEvent = async (id: string): Promise<EventDetails> => {
    const response = await apiClient.delete<EventDetails>(`/events/${id}/subscribe`)
    return response.data;
}

export const removeParticipant = async (eventId: string, userId: string): Promise<EventDetails> => {
    const response = await apiClient.delete<EventDetails>(`/events/${eventId}/participants/${userId}`);
    return response.data;
}
