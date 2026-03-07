import axiosInstance from '../axios';
import { authEndpoints } from '../endpoints/auth';
import type {
    LoginRequest,
    RegisterRequest,
    RefreshRequest,
    TokenResponse,
    UserResponse,
    ValidateInviteResponse,
    CreateInviteRequest,
    InviteResponse,
} from '@/types';

export const authService = {
    async login(data: LoginRequest): Promise<TokenResponse> {
        const response = await axiosInstance.post<TokenResponse>(authEndpoints.login, data);
        return response.data;
    },

    async register(data: RegisterRequest): Promise<UserResponse> {
        const response = await axiosInstance.post<UserResponse>(authEndpoints.register, data);
        return response.data;
    },

    async refresh(data: RefreshRequest): Promise<TokenResponse> {
        const response = await axiosInstance.post<TokenResponse>(authEndpoints.refresh, data);
        return response.data;
    },

    async getMe(): Promise<UserResponse> {
        const response = await axiosInstance.get<UserResponse>(authEndpoints.me);
        return response.data;
    },

    async validateInvite(code: string): Promise<ValidateInviteResponse> {
        const response = await axiosInstance.get<ValidateInviteResponse>(
            authEndpoints.validateInvite(code)
        );
        return response.data;
    },

    async createInvite(data: CreateInviteRequest): Promise<InviteResponse> {
        const response = await axiosInstance.post<InviteResponse>(
            authEndpoints.invites.create,
            data
        );
        return response.data;
    },

    async listInvites(): Promise<InviteResponse[]> {
        const response = await axiosInstance.get<InviteResponse[]>(authEndpoints.invites.list);
        return response.data;
    },
};
