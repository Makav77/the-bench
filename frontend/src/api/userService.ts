import axios from "axios";
import apiClient from "./apiClient";

export enum Role {
    ADMIN = "admin",
    USER = "user",
    MODERATOR = "moderator",
};

interface UserData {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    dateOfBirth: string;
    role: Role;
};

export interface ProfileSummaryDTO {
    id: string;
    firstname: string;
    lastname: string;
    profilePictureUrl: string;
    badges: string[];
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
}

const API_URL = "http://localhost:3000/users";

export const getUsers = async() => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("getUsers error : " + error);
    }
}

export const getUserById = async(id: string) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("getUserById error : " + error);
    }
}

export const createUser = async(userData: UserData) => {
    try {
        const response = await axios.post(API_URL, userData);
        return response.data;
    } catch (error) {
        console.error("createUser error : " + error);
    }
}

export const updateUser = async(id: string, userData: UserData) => {
    try {
        const response = await axios.patch(`${API_URL}/${id}`, userData);
        return response.data;
    } catch (error) {
        console.error("updateUser error : " + error);
    }
}

export const deleteUser = async(id: string) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("deleteUser error : " + error);
    }
}

export const getProfileSummary = async(userId: string) => {
    try {
        const response = await apiClient.get(`/users/${userId}/profile`);
        return response.data; 
    } catch (error) {
        console.error("getProfileSummary error : " + error);
    }
}