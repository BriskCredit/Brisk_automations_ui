import axiosInstance from '../axios';
import { customerCallsEndpoints } from '../endpoints';
import type { StatusResponse, PreviewResponse, RunResponse, RunRequest } from '@/types';

export const customerCallsService = {
    async getStatus(): Promise<StatusResponse> {
        const response = await axiosInstance.get<StatusResponse>(customerCallsEndpoints.status);
        return response.data;
    },

    async getPreview(): Promise<PreviewResponse> {
        const response = await axiosInstance.get<PreviewResponse>(customerCallsEndpoints.preview);
        return response.data;
    },

    async run(data?: RunRequest): Promise<RunResponse> {
        const response = await axiosInstance.post<RunResponse>(
            customerCallsEndpoints.run,
            data || {}
        );
        return response.data;
    },

    async toggle(isActive: boolean): Promise<StatusResponse> {
        const response = await axiosInstance.post<StatusResponse>(
            customerCallsEndpoints.toggle,
            null,
            { params: { is_active: isActive } }
        );
        return response.data;
    },
};
