/**
 * Jobs API Endpoints
 */

export const jobsEndpoints = {
    // Jobs CRUD
    list: '/admin/jobs',
    create: '/admin/jobs',
    getById: (id: number) => `/admin/jobs/${id}`,
    update: (id: number) => `/admin/jobs/${id}`,
    delete: (id: number) => `/admin/jobs/${id}`,

    // Job actions
    publish: (id: number) => `/admin/jobs/${id}/publish`,
    close: (id: number) => `/admin/jobs/${id}/close`,
    reopen: (id: number) => `/admin/jobs/${id}/reopen`,

    // Applications for a job
    applications: (jobId: number) => `/admin/jobs/${jobId}/applications`,
    applicationStats: (jobId: number) => `/admin/jobs/${jobId}/applications/stats`,
    rejectRemaining: (jobId: number) => `/admin/jobs/${jobId}/applications/reject-remaining`,

    // Single application operations
    getApplication: (applicationId: number) => `/admin/jobs/applications/${applicationId}`,
    updateApplicationStatus: (applicationId: number) => `/admin/jobs/applications/${applicationId}/status`,
    deleteApplication: (applicationId: number) => `/admin/jobs/applications/${applicationId}`,
};
