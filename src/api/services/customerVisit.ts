import axiosInstance from '../axios';
import { customerVisitEndpoints } from '../endpoints';
import type { StatusResponse, PreviewResponse, RunResponse, RunRequest } from '@/types';

export const customerVisitService = {
    async getStatus(): Promise<StatusResponse> {
        const response = await axiosInstance.get<StatusResponse>(customerVisitEndpoints.status);
        return response.data;
    },

    async getPreview(): Promise<PreviewResponse> {
        const response = await axiosInstance.get<PreviewResponse>(customerVisitEndpoints.preview);
        return response.data;
    },

    async run(data?: RunRequest): Promise<RunResponse> {
        const response = await axiosInstance.post<RunResponse>(
            customerVisitEndpoints.run,
            data || {}
        );
        return response.data;
    },

    async toggle(isActive: boolean): Promise<StatusResponse> {
        const response = await axiosInstance.post<StatusResponse>(
            customerVisitEndpoints.toggle,
            null,
            { params: { is_active: isActive } }
        );
        return response.data;
    },
};
