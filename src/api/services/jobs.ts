import axiosInstance from '../axios';
import { jobsEndpoints } from '../endpoints';
import type {
    JobResponse,
    JobCreate,
    JobUpdate,
    ApplicationResponse,
    ApplicationStatusUpdate,
    ApplicationStats,
    PaginatedResponse,
    PaginationParams,
    JobStatus,
    DeleteResponse,
} from '@/types';

// ============================================
// Jobs Service
// ============================================
export interface JobsQueryParams extends PaginationParams {
    status?: JobStatus;
    include_expired?: boolean;
}

export const jobsService = {
    async getAll(params?: JobsQueryParams): Promise<PaginatedResponse<JobResponse>> {
        const response = await axiosInstance.get<PaginatedResponse<JobResponse>>(
            jobsEndpoints.list,
            { params }
        );
        return response.data;
    },

    async getById(id: number): Promise<JobResponse> {
        const response = await axiosInstance.get<JobResponse>(jobsEndpoints.getById(id));
        return response.data;
    },

    async create(data: JobCreate): Promise<JobResponse> {
        const response = await axiosInstance.post<JobResponse>(jobsEndpoints.create, data);
        return response.data;
    },

    async update(id: number, data: JobUpdate): Promise<JobResponse> {
        const response = await axiosInstance.patch<JobResponse>(jobsEndpoints.update(id), data);
        return response.data;
    },

    async delete(id: number): Promise<DeleteResponse> {
        const response = await axiosInstance.delete<DeleteResponse>(jobsEndpoints.delete(id));
        return response.data;
    },

    async publish(id: number): Promise<JobResponse> {
        const response = await axiosInstance.post<JobResponse>(jobsEndpoints.publish(id));
        return response.data;
    },

    async close(id: number): Promise<JobResponse> {
        const response = await axiosInstance.post<JobResponse>(jobsEndpoints.close(id));
        return response.data;
    },

    async reopen(id: number): Promise<JobResponse> {
        const response = await axiosInstance.post<JobResponse>(jobsEndpoints.reopen(id));
        return response.data;
    },
};

// ============================================
// Applications Service
// ============================================
export interface ApplicationsQueryParams extends PaginationParams {}

export const applicationsService = {
    async getByJobId(
        jobId: number,
        params?: ApplicationsQueryParams
    ): Promise<PaginatedResponse<ApplicationResponse>> {
        const response = await axiosInstance.get<PaginatedResponse<ApplicationResponse>>(
            jobsEndpoints.applications(jobId),
            { params }
        );
        return response.data;
    },

    async getStats(jobId: number): Promise<ApplicationStats> {
        const response = await axiosInstance.get<ApplicationStats>(
            jobsEndpoints.applicationStats(jobId)
        );
        return response.data;
    },

    async getById(applicationId: number): Promise<ApplicationResponse> {
        const response = await axiosInstance.get<ApplicationResponse>(
            jobsEndpoints.getApplication(applicationId)
        );
        return response.data;
    },

    async updateStatus(
        applicationId: number,
        data: ApplicationStatusUpdate
    ): Promise<ApplicationResponse> {
        const response = await axiosInstance.patch<ApplicationResponse>(
            jobsEndpoints.updateApplicationStatus(applicationId),
            data
        );
        return response.data;
    },

    async delete(applicationId: number): Promise<DeleteResponse> {
        const response = await axiosInstance.delete<DeleteResponse>(
            jobsEndpoints.deleteApplication(applicationId)
        );
        return response.data;
    },

    async rejectRemaining(jobId: number, data?: { admin_notes?: string }): Promise<{
        success: boolean;
        rejected_count: number;
        message: string;
    }> {
        const response = await axiosInstance.post(
            jobsEndpoints.rejectRemaining(jobId),
            data ?? {}
        );
        return response.data;
    },
};
