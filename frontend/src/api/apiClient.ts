import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders, HeadersDefaults, AxiosHeaderValue } from 'axios';
console.log("Node env: ", import.meta.env.VITE_NODE_ENV);
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_NODE_ENV === 'prod' ? 'http://209.38.138.250:3000/' : 'http://localhost:3000/',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers = (config.headers ?? {}) as AxiosRequestHeaders;
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error),
);

apiClient.interceptors.response.use(
    restrictions => restrictions,
    async error => {
        if (error.response?.status === 403) {
            alert("Action prohibited: You do not have the necessary rights.");
        }
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
            })
            .then((token) => {
                originalRequest.headers = (originalRequest.headers ?? {}) as AxiosRequestHeaders;
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                return apiClient(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const { accessToken: newToken } = await import('./authService').then(mod => mod.refreshToken());
            localStorage.setItem('accessToken', newToken);
            apiClient.defaults.headers = apiClient.defaults.headers = (apiClient.defaults.headers ?? {}) as HeadersDefaults & {[key: string]: AxiosHeaderValue;};
            apiClient.defaults.headers['Authorization'] = `Bearer ${newToken}`;
            processQueue(null, newToken);

            originalRequest.headers = (originalRequest.headers ?? {}) as AxiosRequestHeaders;
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return apiClient(originalRequest);
        } catch (err) {
            processQueue(err, null);
            return Promise.reject(err);
        } finally {
            isRefreshing = false;
        }
        }
        return Promise.reject(error);
    },
);

export default apiClient;
