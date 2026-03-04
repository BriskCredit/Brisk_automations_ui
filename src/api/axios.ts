import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Add any auth headers here if needed in the future
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle common errors
        if (error.response) {
            const { status, data } = error.response;

            // You can add common error handling here
            console.error(`API Error [${status}]:`, data?.detail || 'Unknown error');
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
