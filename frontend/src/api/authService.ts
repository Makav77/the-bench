import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { User } from "../../../backend/src/modules/Users/entities/user.entity";

interface userCredentials {
    email: string;
    password: string;
    rememberMe: boolean;
};

// Instance axios centralisé
const api = axios.create({
    baseURL: "http://localhost:3000/auth",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor pour ajouter l'accessToken à chaque requête
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers = config.headers ?? {};
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);


// File d'attente pour les requêtes en attente pendant le rafraîchissement
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void,
    reject: (error: unknown) => void
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Interceptor pour gérer les erreurs 401 et refresh le token
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async(error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
            .then((token) => {
                originalRequest.headers = originalRequest.headers ?? {};
                originalRequest.headers["Authorization"] = `Bearer ${token}`;
                return api(originalRequest);
            })
            .catch (error => Promise.reject(error));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const data = await refreshToken();
            const newToken = data.accessToken;
            localStorage.setItem("accessToken", newToken);
            api.defaults.headers = api.defaults.headers ?? {};
            api.defaults.headers["Authorization"] = `Bearer ${newToken}`;
            processQueue(null, newToken);
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return api(originalRequest);
        } catch (error) {
            processQueue(error, null);
            return Promise.reject(error);
        } finally {
            isRefreshing = false;
        }
    }
    return Promise.reject(error);
});

// Route de login
export const loginUser = async(userCredentials: userCredentials) => {
    try {
        const response = await api.post("/login", userCredentials);
        return response.data;
    } catch(error) {
        console.error("Login error : " + error);
        throw error;
    }
};

// Route de refresh pour obtenir un nouveau accessToken
export const refreshToken = async() =>{
    try {
        const response = await api.post("/refresh");
        return response.data;
    } catch (error) {
        console.error("Refresh token error : " + error);
        throw error;
    }
};

// Route de Logout
export const logout = async() => {
    try {
        await api.post("/logout");
    } catch(error) {
        console.error("Logout error : " + error);
    } finally {
        localStorage.removeItem("accessToken");
        delete api.defaults.headers?.["Authorization"];
    }
}

export const fetchMe = async(): Promise<User> => {
    try {
        const response = await api.get("/me");
        return response.data;
    } catch(error) {
        console.error("fetchMe error : " + error);
        throw error;
    }
}

export default api;
