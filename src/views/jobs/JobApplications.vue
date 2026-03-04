<script setup lang="ts">
    import { ref, computed } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
    import { jobsService, applicationsService } from '@/api/services';
    import { useNotificationStore } from '@/stores';
    import { Badge, Spinner, ConfirmDialog, StatsCard } from '@/components/common';
    import ApplicationDetailModal from './ApplicationDetailModal.vue';
    import type { ApplicationStatus, AIAnalysisStatus, ApplicationResponse } from '@/types';

    const route = useRoute();
    const router = useRouter();
    const queryClient = useQueryClient();
    const notifications = useNotificationStore();

    const jobId = computed(() => Number(route.params.jobId));
    const page = ref(1);
    const pageSize = ref(5);
    
    // Delete state
    const showDeleteConfirm = ref(false);
    const deletingApplication = ref<ApplicationResponse | null>(null);
    
    // Bulk reject state
    const showRejectRemainingConfirm = ref(false);

    // Detail modal state
    const showDetailModal = ref(false);
    const selectedApplication = ref<ApplicationResponse | null>(null);

    const statusOptions: ApplicationStatus[] = [
        'submitted',
        'reviewed',
        'shortlisted',
        'contacted',
        'rejected',
        'hired',
    ];

    // Fetch job details
    const {
        data: job,
        isLoading: jobLoading,
    } = useQuery({
        queryKey: computed(() => ['job', jobId.value]),
        queryFn: () => jobsService.getById(jobId.value),
    });

    // Fetch applications
    const {
        data: applicationsResponse,
        isLoading: applicationsLoading,
    } = useQuery({
        queryKey: computed(() => ['applications', jobId.value, page.value, pageSize.value]),
        queryFn: () => applicationsService.getByJobId(jobId.value, { page: page.value, page_size: pageSize.value }),
    });

    // Fetch stats
    const { data: stats } = useQuery({
        queryKey: computed(() => ['applicationStats', jobId.value]),
        queryFn: () => applicationsService.getStats(jobId.value),
    });

    // Mutations
    const updateStatusMutation = useMutation({
        mutationFn: ({ appId, status }: { appId: number; status: ApplicationStatus }) =>
            applicationsService.updateStatus(appId, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['applicationStats'] });
            notifications.success('Application status updated');
        },
        onError: () => {
            notifications.error('Failed to update status');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (appId: number) => applicationsService.delete(appId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['applicationStats'] });
            queryClient.invalidateQueries({ queryKey: ['job'] });
            notifications.success('Application deleted');
            closeDeleteConfirm();
        },
        onError: () => {
            notifications.error('Failed to delete application');
        },
    });

    const rejectRemainingMutation = useMutation({
        mutationFn: () => applicationsService.rejectRemaining(jobId.value),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['applicationStats'] });
            queryClient.invalidateQueries({ queryKey: ['job'] });
            notifications.success(data.message);
            showRejectRemainingConfirm.value = false;
        },
        onError: () => {
            notifications.error('Failed to reject applications');
        },
    });

    const applications = computed(() => applicationsResponse.value?.items ?? []);
    const pagination = computed(() => {
        if (!applicationsResponse.value) return undefined;
        return {
            page: applicationsResponse.value.page,
            pageSize: applicationsResponse.value.page_size,
            total: applicationsResponse.value.total,
            totalPages: applicationsResponse.value.total_pages,
            hasNext: applicationsResponse.value.has_next,
            hasPrev: applicationsResponse.value.has_prev,
        };
    });

    const isLoading = computed(() => jobLoading.value || applicationsLoading.value);

    // Methods
    function goBack() {
        router.push('/jobs');
    }

    function handlePageChange(newPage: number) {
        page.value = newPage;
    }

    function openDetailModal(app: ApplicationResponse) {
        selectedApplication.value = app;
        showDetailModal.value = true;
    }

    function closeDetailModal() {
        showDetailModal.value = false;
        selectedApplication.value = null;
    }

    function handleApplicationUpdated() {
        // Data is already invalidated in the modal, just close it
    }

    function handleStatusChange(app: ApplicationResponse, event: Event) {
        event.stopPropagation();
        const target = event.target as HTMLSelectElement;
        const newStatus = target.value as ApplicationStatus;
        if (newStatus !== app.status) {
            updateStatusMutation.mutate({ appId: app.id, status: newStatus });
        }
    }

    function openDeleteConfirm(app: ApplicationResponse, event: Event) {
        event.stopPropagation();
        deletingApplication.value = app;
        showDeleteConfirm.value = true;
    }

    function closeDeleteConfirm() {
        showDeleteConfirm.value = false;
        deletingApplication.value = null;
    }

    function confirmDelete() {
        if (deletingApplication.value) {
            deleteMutation.mutate(deletingApplication.value.id);
        }
    }

    function getRank(index: number): number {
        return (page.value - 1) * pageSize.value + index + 1;
    }

    function getScoreClass(score: number | null): string {
        if (score === null) return 'text-gray-400';
        if (score >= 7) return 'text-green-600 bg-green-100';
        if (score >= 4) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    }

    function formatScore(score: number | null): string {
        if (score === null) return '-';
        return `${score.toFixed(1)}/10`;
    }

    

    function getAIStatusClass(status: AIAnalysisStatus): string {
        switch (status) {
            case 'pending':
                return 'text-gray-400';
            case 'processing':
                return 'text-blue-500';
            case 'completed':
                return 'text-green-500';
            case 'failed':
                return 'text-red-500';
            default:
                return 'text-gray-400';
        }
    }

    function formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;

        return date.toLocaleDateString('en-AU', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }

    function getJobStatusVariant(): 'success' | 'warning' | 'error' | 'gray' {
        if (!job.value) return 'gray';
        if (job.value.is_expired) return 'warning';
        if (job.value.status === 'draft') return 'gray';
        if (job.value.status === 'published') return 'success';
        if (job.value.status === 'closed') return 'error';
        return 'gray';
    }

    function getJobStatusLabel(): string {
        if (!job.value) return '';
        if (job.value.is_expired) return 'Expired';
        if (job.value.status === 'draft') return 'Draft';
        if (job.value.status === 'published') return 'Active';
        if (job.value.status === 'closed') return 'Closed';
        return job.value.status;
    }
</script>

<template>
    <div class="space-y-6">
        <!-- Back Button & Header -->
        <div>
            <button
                class="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
                @click="goBack"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                </svg>
                Back to Jobs
            </button>

            <div v-if="job" class="flex items-start justify-between">
                <div>
                    <h1 class="text-2xl font-semibold text-gray-900">{{ job.title }}</h1>
                    <div class="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span v-if="job.department">{{ job.department }}</span>
                        <span v-if="job.location">{{ job.location }}</span>
                        <Badge :variant="getJobStatusVariant()">
                            {{ getJobStatusLabel() }}
                        </Badge>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {{ job.application_count }} applications
                        </span>
                    </div>
                </div>
                <button
                    v-if="stats && (stats.by_status.shortlisted ?? 0) > 0 && ((stats.by_status.submitted ?? 0) + (stats.by_status.reviewed ?? 0)) > 0"
                    class="btn-secondary text-red-600 border-red-300 hover:bg-red-50"
                    @click="showRejectRemainingConfirm = true"
                >
                    Reject Remaining
                </button>
            </div>
        </div>

        <!-- Stats Cards -->
        <div v-if="stats" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatsCard
                title="Total"
                :value="stats.total_applications"
                subtitle="All applications"
            />
            <StatsCard
                title="Submitted"
                :value="stats.by_status.submitted ?? 0"
                subtitle="New"
            />
            <StatsCard
                title="Shortlisted"
                :value="stats.by_status.shortlisted ?? 0"
                subtitle="For interview"
            />
            <StatsCard
                title="Contacted"
                :value="stats.by_status.contacted ?? 0"
                subtitle="In progress"
            />
            <StatsCard
                title="Hired"
                :value="stats.by_status.hired ?? 0"
                subtitle="Successful"
            />
            <StatsCard
                title="Rejected"
                :value="stats.by_status.rejected ?? 0"
                subtitle="Not selected"
            />
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center py-12">
            <Spinner size="lg" />
        </div>

        <!-- Applications Table -->
        <div v-else-if="applications.length > 0" class="card overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rank
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                AI Score
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Candidate
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                AI Status
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Applied
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Resume
                            </th>
                            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <template v-for="(app, index) in applications" :key="app.id">
                            <tr
                                class="hover:bg-gray-50 cursor-pointer transition-colors"
                                @click="openDetailModal(app)"
                            >
                                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    #{{ getRank(index) }}
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap">
                                    <span
                                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                        :class="getScoreClass(app.ai_score)"
                                    >
                                        {{ formatScore(app.ai_score) }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-900">
                                        {{ app.applicant_name }}
                                    </div>
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap">
                                    <div class="text-sm">
                                        <a
                                            :href="`mailto:${app.applicant_email}`"
                                            class="text-primary-600 hover:text-primary-800"
                                            @click.stop
                                        >
                                            {{ app.applicant_email }}
                                        </a>
                                        <div v-if="app.applicant_phone" class="text-gray-500 text-xs">
                                            {{ app.applicant_phone }}
                                        </div>
                                    </div>
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap">
                                    <select
                                        :value="app.status"
                                        class="text-xs border border-gray-300 rounded-md px-2 py-1 focus:ring-primary-500 focus:border-primary-500"
                                        @click.stop
                                        @change="handleStatusChange(app, $event)"
                                    >
                                        <option v-for="status in statusOptions" :key="status" :value="status">
                                            {{ status.charAt(0).toUpperCase() + status.slice(1) }}
                                        </option>
                                    </select>
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap">
                                    <div class="flex items-center gap-1.5" :class="getAIStatusClass(app.ai_analysis_status)">
                                        <template v-if="app.ai_analysis_status === 'pending'">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span class="text-xs">Pending</span>
                                        </template>
                                        <template v-else-if="app.ai_analysis_status === 'processing'">
                                            <Spinner size="sm" />
                                            <span class="text-xs">Analyzing...</span>
                                        </template>
                                        <template v-else-if="app.ai_analysis_status === 'completed'">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span class="text-xs">Completed</span>
                                        </template>
                                        <template v-else-if="app.ai_analysis_status === 'failed'">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <span class="text-xs">Failed</span>
                                        </template>
                                    </div>
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {{ formatDate(app.created_at) }}
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap">
                                    <template v-if="app.resume_filename">
                                        <a
                                            :href="app.resume_url ?? '#'"
                                            target="_blank"
                                            class="text-primary-600 hover:text-primary-800 text-sm"
                                            @click.stop
                                        >
                                            {{ app.resume_filename }}
                                        </a>
                                    </template>
                                    <span v-else class="text-gray-400 text-sm">-</span>
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap text-right">
                                    <button
                                        class="p-1 text-red-400 hover:text-red-600"
                                        title="Delete Application"
                                        @click="openDeleteConfirm(app, $event)"
                                    >
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div
                v-if="pagination && pagination.totalPages > 1"
                class="px-4 py-3 border-t border-gray-200 flex items-center justify-between"
            >
                <div class="text-sm text-gray-500">
                    Showing {{ (pagination.page - 1) * pagination.pageSize + 1 }} to
                    {{ Math.min(pagination.page * pagination.pageSize, pagination.total) }}
                    of {{ pagination.total }} applications
                </div>
                <nav class="flex items-center gap-1">
                    <button
                        class="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        :disabled="!pagination.hasPrev"
                        @click="handlePageChange(pagination.page - 1)"
                    >
                        Previous
                    </button>
                    <span class="px-3 py-1.5 text-sm text-gray-700">
                        Page {{ pagination.page }} of {{ pagination.totalPages }}
                    </span>
                    <button
                        class="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        :disabled="!pagination.hasNext"
                        @click="handlePageChange(pagination.page + 1)"
                    >
                        Next
                    </button>
                </nav>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else class="card p-12 text-center">
            <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            </div>
            <p class="text-sm font-medium text-gray-900">No applications yet</p>
            <p class="mt-1 text-sm text-gray-500">No applications yet for this position.</p>
        </div>

        <!-- Delete Confirmation -->
        <ConfirmDialog
            :is-open="showDeleteConfirm"
            title="Delete Application"
            :message="`Are you sure you want to delete the application from ${deletingApplication?.applicant_name}? This action cannot be undone.`"
            confirm-text="Delete"
            variant="danger"
            :loading="deleteMutation.isPending.value"
            @confirm="confirmDelete"
            @cancel="closeDeleteConfirm"
        />

        <!-- Reject Remaining Confirmation -->
        <ConfirmDialog
            :is-open="showRejectRemainingConfirm"
            title="Reject Remaining Applications"
            :message="`This will reject all ${(stats?.by_status.submitted ?? 0) + (stats?.by_status.reviewed ?? 0)} applications that are still in 'Submitted' or 'Reviewed' status. This action cannot be undone.`"
            confirm-text="Reject All"
            variant="danger"
            :loading="rejectRemainingMutation.isPending.value"
            @confirm="rejectRemainingMutation.mutate()"
            @cancel="showRejectRemainingConfirm = false"
        />

        <!-- Application Detail Modal -->
        <ApplicationDetailModal
            :is-open="showDetailModal"
            :application="selectedApplication"
            @close="closeDetailModal"
            @updated="handleApplicationUpdated"
        />
    </div>
</template>
