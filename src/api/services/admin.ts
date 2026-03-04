import axiosInstance from '../axios';
import { adminEndpoints } from '../endpoints';
import type {
    ReportTypeResponse,
    ReportTypeCreate,
    ReportTypeUpdate,
    RecipientResponse,
    RecipientCreate,
    RecipientUpdate,
    FileResponse,
    DeleteResponse,
    PaginatedResponse,
    PaginationParams,
} from '@/types';

// ============================================
// Report Types Service
// ============================================
export interface ReportTypesQueryParams extends PaginationParams {
    active_only?: boolean;
}

export const reportTypesService = {
    async getAll(params?: ReportTypesQueryParams): Promise<PaginatedResponse<ReportTypeResponse>> {
        const response = await axiosInstance.get<PaginatedResponse<ReportTypeResponse>>(
            adminEndpoints.reportTypes.list,
            { params }
        );
        return response.data;
    },

    async getById(id: number): Promise<ReportTypeResponse> {
        const response = await axiosInstance.get<ReportTypeResponse>(
            adminEndpoints.reportTypes.getById(id)
        );
        return response.data;
    },

    async create(data: ReportTypeCreate): Promise<ReportTypeResponse> {
        const response = await axiosInstance.post<ReportTypeResponse>(
            adminEndpoints.reportTypes.create,
            data
        );
        return response.data;
    },

    async update(id: number, data: ReportTypeUpdate): Promise<ReportTypeResponse> {
        const response = await axiosInstance.patch<ReportTypeResponse>(
            adminEndpoints.reportTypes.update(id),
            data
        );
        return response.data;
    },

    async delete(id: number): Promise<DeleteResponse> {
        const response = await axiosInstance.delete<DeleteResponse>(
            adminEndpoints.reportTypes.delete(id)
        );
        return response.data;
    },
};

// ============================================
// Recipients Service
// ============================================
export interface RecipientsQueryParams extends PaginationParams {
    report_type_code?: string;
}

export const recipientsService = {
    async getAll(params?: RecipientsQueryParams): Promise<PaginatedResponse<RecipientResponse>> {
        const response = await axiosInstance.get<PaginatedResponse<RecipientResponse>>(
            adminEndpoints.recipients.list,
            { params }
        );
        return response.data;
    },

    async getById(id: number): Promise<RecipientResponse> {
        const response = await axiosInstance.get<RecipientResponse>(
            adminEndpoints.recipients.getById(id)
        );
        return response.data;
    },

    async create(data: RecipientCreate): Promise<RecipientResponse> {
        const response = await axiosInstance.post<RecipientResponse>(
            adminEndpoints.recipients.create,
            data
        );
        return response.data;
    },

    async update(id: number, data: RecipientUpdate): Promise<RecipientResponse> {
        const response = await axiosInstance.patch<RecipientResponse>(
            adminEndpoints.recipients.update(id),
            data
        );
        return response.data;
    },

    async delete(id: number): Promise<DeleteResponse> {
        const response = await axiosInstance.delete<DeleteResponse>(
            adminEndpoints.recipients.delete(id)
        );
        return response.data;
    },
};

// ============================================
// Files Service
// ============================================
export interface FilesQueryParams extends PaginationParams {
    report_type_code?: string;
    start_date?: string;
    end_date?: string;
}

export const filesService = {
    async getAll(params?: FilesQueryParams): Promise<PaginatedResponse<FileResponse>> {
        const response = await axiosInstance.get<PaginatedResponse<FileResponse>>(
            adminEndpoints.files.list,
            { params }
        );
        return response.data;
    },

    async getById(id: number): Promise<FileResponse> {
        const response = await axiosInstance.get<FileResponse>(adminEndpoints.files.getById(id));
        return response.data;
    },
};
