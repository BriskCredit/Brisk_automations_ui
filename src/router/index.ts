import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: 'Dashboard' },
    },
    {
        path: '/reports/customer-calls',
        name: 'CustomerCalls',
        component: () => import('@/views/reports/CustomerCalls.vue'),
        meta: { title: 'Customer Calls Report' },
    },
    {
        path: '/reports/customer-visit',
        name: 'CustomerVisit',
        component: () => import('@/views/reports/CustomerVisit.vue'),
        meta: { title: 'Customer Visit Report' },
    },
    {
        path: '/jobs',
        name: 'Jobs',
        component: () => import('@/views/jobs/JobsList.vue'),
        meta: { title: 'Job Applications' },
    },
    {
        path: '/jobs/:jobId/applications',
        name: 'JobApplications',
        component: () => import('@/views/jobs/JobApplications.vue'),
        meta: { title: 'Applications' },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Update document title on navigation
router.afterEach((to) => {
    const title = to.meta?.title as string | undefined;
    document.title = title ? `${title} | Brisk Automations` : 'Brisk Automations';
});

export default router;
