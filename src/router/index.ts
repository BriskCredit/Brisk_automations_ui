import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores';

const routes: RouteRecordRaw[] = [
    // Auth routes (public)
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/auth/Login.vue'),
        meta: { title: 'Login', public: true, authPage: true },
    },
    {
        path: '/signup',
        name: 'Signup',
        component: () => import('@/views/auth/Signup.vue'),
        meta: { title: 'Sign Up', public: true, authPage: true },
    },
    // Protected routes
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
    {
        path: '/invites',
        name: 'Invites',
        component: () => import('@/views/settings/Invites.vue'),
        meta: { title: 'Invites' },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Auth guard
router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore();

    // Initialize auth state if not done yet
    if (!authStore.isInitialized) {
        await authStore.initialize();
    }

    const isPublic = to.meta?.public === true;
    const isAuthPage = to.meta?.authPage === true;
    const isAuthenticated = authStore.isAuthenticated;

    // Redirect authenticated users away from auth pages
    if (isAuthPage && isAuthenticated) {
        next('/');
        return;
    }

    // Redirect unauthenticated users to login for protected routes
    if (!isPublic && !isAuthenticated) {
        next({ path: '/login', query: { redirect: to.fullPath } });
        return;
    }

    next();
});

// Update document title on navigation
router.afterEach((to) => {
    const title = to.meta?.title as string | undefined;
    document.title = title ? `${title} | Brisk Automations` : 'Brisk Automations';
});

export default router;
