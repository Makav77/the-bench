import axios from "axios";
import apiClient from "./apiClient";

export enum Role {
    ADMIN = "admin",
    USER = "user",
    MODERATOR = "moderator",
};

export interface UserData {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    dateOfBirth: string;
    role: Role;
};

export interface StaffDTO {
    id: string;
    firstname: string;
    lastname: string;
    profilePicture?: string;
}

export interface ModeratorsAndAdminsDTO {
    admins: StaffDTO[];
    moderators: StaffDTO[];
}

export interface ProfileSummaryDTO {
    id: string;
    firstname: string;
    lastname: string;
    profilePictureUrl: string;
    points: number;
    events: {
        id: string;
        name: string;
        startDate: string;
    }[];
    challenges: {
        id: string;
        title: string;
        startDate: string;
    }[];
    marketItems: {
        id: string;
        title: string;
        updatedAt: string;
        images: string[];
    }[];
    badges: {
        id: string;
        imageUrl: string;
        cost: number;
        available: boolean;
    }[];
    isFriend?: boolean;
    requestSent?: boolean;
    requestReceived?: boolean;
}

const API_URL = import.meta.env.VITE_NODE_ENV === 'prod' ? "http://209.38.138.250:3000/users" : "http://localhost:3000/users";

export const getUsers = async () => {
    try {
        const response = await apiClient.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("getUsers error : " + error);
    }
}

export const getUserById = async (id: string) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("getUserById error : " + error);
    }
}

export const createUser = async (userData: UserData) => {
    try {
        const response = await axios.post(API_URL, userData);
        return response.data;
    } catch (error) {
        console.error("createUser error : " + error);
    }
}

export const updateUser = async (id: string, userData: UserData) => {
    try {
        const response = await axios.patch(`${API_URL}/${id}`, userData);
        return response.data;
    } catch (error) {
        console.error("updateUser error : " + error);
    }
}

export const deleteUser = async (id: string) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("deleteUser error : " + error);
    }
}

export const getProfileSummary = async (userId: string) => {
    try {
        const response = await apiClient.get(`/users/${userId}/profile`);
        return response.data;
    } catch (error) {
        console.error("getProfileSummary error : " + error);
    }
}

export const getModeratorsAndAdmins = async (): Promise<ModeratorsAndAdminsDTO> => {
    const response = await apiClient.get("/users/staff");
    return response.data;
};
