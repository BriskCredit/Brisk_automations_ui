import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/api/services';
import type { UserResponse, LoginRequest, RegisterRequest } from '@/types';

const ACCESS_TOKEN_KEY = 'brisk_access_token';
const REFRESH_TOKEN_KEY = 'brisk_refresh_token';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<UserResponse | null>(null);
    const accessToken = ref<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY));
    const refreshToken = ref<string | null>(localStorage.getItem(REFRESH_TOKEN_KEY));
    const isLoading = ref(false);
    const isInitialized = ref(false);

    const isAuthenticated = computed(() => !!accessToken.value && !!user.value);

    function setTokens(access: string, refresh: string) {
        accessToken.value = access;
        refreshToken.value = refresh;
        localStorage.setItem(ACCESS_TOKEN_KEY, access);
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    }

    function clearTokens() {
        accessToken.value = null;
        refreshToken.value = null;
        user.value = null;
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    }

    async function login(credentials: LoginRequest): Promise<void> {
        isLoading.value = true;
        try {
            const response = await authService.login(credentials);
            setTokens(response.access_token, response.refresh_token);
            await fetchUser();
        } finally {
            isLoading.value = false;
        }
    }

    async function register(data: RegisterRequest): Promise<UserResponse> {
        isLoading.value = true;
        try {
            const response = await authService.register(data);
            return response;
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchUser(): Promise<void> {
        if (!accessToken.value) return;
        try {
            user.value = await authService.getMe();
        } catch {
            // Token might be invalid, try to refresh
            await refreshAccessToken();
        }
    }

    async function refreshAccessToken(): Promise<boolean> {
        if (!refreshToken.value) {
            clearTokens();
            return false;
        }

        try {
            const response = await authService.refresh({ refresh_token: refreshToken.value });
            setTokens(response.access_token, response.refresh_token);
            await authService.getMe().then((u) => {
                user.value = u;
            });
            return true;
        } catch {
            clearTokens();
            return false;
        }
    }

    async function initialize(): Promise<void> {
        if (isInitialized.value) return;
        
        if (accessToken.value) {
            try {
                user.value = await authService.getMe();
            } catch {
                // Try refresh if access token is invalid
                const refreshed = await refreshAccessToken();
                if (!refreshed) {
                    clearTokens();
                }
            }
        }
        isInitialized.value = true;
    }

    function logout(): void {
        clearTokens();
    }

    function getAccessToken(): string | null {
        return accessToken.value;
    }

    function getRefreshToken(): string | null {
        return refreshToken.value;
    }

    return {
        user,
        accessToken,
        refreshToken,
        isLoading,
        isAuthenticated,
        isInitialized,
        login,
        register,
        logout,
        fetchUser,
        refreshAccessToken,
        initialize,
        getAccessToken,
        getRefreshToken,
        setTokens,
        clearTokens,
    };
});
