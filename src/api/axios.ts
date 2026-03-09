import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Extract the server origin from API_BASE_URL (e.g., "http://187.77.168.146:8000" from "http://187.77.168.146:8000/api/v1")
const API_ORIGIN = new URL(API_BASE_URL).origin;

/**
 * Fix file URLs that may contain localhost instead of the actual server URL
 */
export function fixFileUrl(url: string): string {
    if (!url) return url;
    // Replace localhost:8000 with the actual server origin
    return url.replace(/http:\/\/localhost:8000/g, API_ORIGIN);
}

const ACCESS_TOKEN_KEY = 'brisk_access_token';
const REFRESH_TOKEN_KEY = 'brisk_refresh_token';

// Public endpoints that don't require auth
const PUBLIC_ENDPOINTS = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/validate-invite',
    '/public/jobs', // Public job listings
]; 

function isPublicEndpoint(url: string | undefined): boolean {
    if (!url) return false;
    return PUBLIC_ENDPOINTS.some((endpoint) => url.startsWith(endpoint) || url.includes(endpoint + '/') || url === endpoint);
}

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000,
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
}

// Request interceptor - Add auth header
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (token && !isPublicEndpoint(config.url)) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle 401 and refresh token
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Don't try to refresh for auth endpoints
            if (isPublicEndpoint(originalRequest.url)) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Wait for the refresh to complete
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

            if (!refreshToken) {
                isRefreshing = false;
                // Clear tokens and redirect to login
                localStorage.removeItem(ACCESS_TOKEN_KEY);
                localStorage.removeItem(REFRESH_TOKEN_KEY);
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refresh_token: refreshToken,
                });

                const { access_token, refresh_token } = response.data;
                localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
                localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);

                processQueue(null, access_token);

                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Clear tokens and redirect to login
                localStorage.removeItem(ACCESS_TOKEN_KEY);
                localStorage.removeItem(REFRESH_TOKEN_KEY);
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Log other errors
        if (error.response) {
            const { status, data } = error.response;
            console.error(`API Error [${status}]:`, (data as { detail?: string })?.detail || 'Unknown error');
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
