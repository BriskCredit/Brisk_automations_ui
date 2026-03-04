/**
 * Admin API Endpoints
 * Contains only endpoint URL strings or functions for dynamic params
 */

export const adminEndpoints = {
    // Report Types
    reportTypes: {
        list: '/admin/report-types',
        getById: (id: number) => `/admin/report-types/${id}`,
        create: '/admin/report-types',
        update: (id: number) => `/admin/report-types/${id}`,
        delete: (id: number) => `/admin/report-types/${id}`,
    },

    // Recipients
    recipients: {
        list: '/admin/recipients',
        getById: (id: number) => `/admin/recipients/${id}`,
        create: '/admin/recipients',
        update: (id: number) => `/admin/recipients/${id}`,
        delete: (id: number) => `/admin/recipients/${id}`,
    },

    // Files
    files: {
        list: '/admin/files',
        getById: (id: number) => `/admin/files/${id}`,
    },
};
