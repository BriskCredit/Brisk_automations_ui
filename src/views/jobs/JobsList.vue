<script setup lang="ts">
    import { ref, computed } from 'vue';
    import { useRouter } from 'vue-router';
    import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
    import { jobsService } from '@/api/services';
    import { useNotificationStore } from '@/stores';
    import { DataTable, Badge, Spinner, ConfirmDialog } from '@/components/common';
    import JobFormModal from './JobFormModal.vue';
    import JobPreviewModal from './JobPreviewModal.vue';
    import type { JobResponse, JobStatus, JobCreate } from '@/types';

    type JobFilter = 'all' | 'active' | 'expired';

    const router = useRouter();
    const queryClient = useQueryClient();
    const notifications = useNotificationStore();

    // State
    const currentFilter = ref<JobFilter>('all');
    const page = ref(1);
    const pageSize = ref(5);

    // Modal states
    const showJobModal = ref(false);
    const editingJob = ref<JobResponse | null>(null);
    const showDeleteConfirm = ref(false);
    const deletingJob = ref<JobResponse | null>(null);
    const showPreviewModal = ref(false);
    const previewingJob = ref<JobResponse | null>(null);

    // Compute API params based on filter
    const apiParams = computed(() => {
        const params: { include_expired?: boolean; status?: JobStatus; page: number; page_size: number } = {
            page: page.value,
            page_size: pageSize.value,
        };

        switch (currentFilter.value) {
            case 'all':
                params.include_expired = true;
                break;
            case 'active':
                params.include_expired = false;
                params.status = 'published';
                break;
            case 'expired':
                params.include_expired = true;
                params.status = 'closed';
                break;
        }

        return params;
    });

    // Fetch jobs
    const {
        data: jobsResponse,
        isLoading,
        error,
    } = useQuery({
        queryKey: computed(() => ['jobs', apiParams.value]),
        queryFn: () => jobsService.getAll(apiParams.value),
    });

    const jobs = computed(() => jobsResponse.value?.items ?? []);
    const pagination = computed(() => {
        if (!jobsResponse.value) return undefined;
        return {
            page: jobsResponse.value.page,
            pageSize: jobsResponse.value.page_size,
            total: jobsResponse.value.total,
            totalPages: jobsResponse.value.total_pages,
            hasNext: jobsResponse.value.has_next,
            hasPrev: jobsResponse.value.has_prev,
        };
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: async ({ data, publish }: { data: JobCreate; publish: boolean }) => {
            return jobsService.create({ ...data, publish });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            notifications.success(variables.publish ? 'Job created and published' : 'Job saved as draft');
            closeJobModal();
        },
        onError: () => {
            notifications.error('Failed to create job');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: JobCreate }) => {
            return jobsService.update(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            notifications.success('Job updated successfully');
            closeJobModal();
        },
        onError: () => {
            notifications.error('Failed to update job');
        },
    });

    const publishMutation = useMutation({
        mutationFn: (id: number) => jobsService.publish(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            notifications.success('Job published successfully');
        },
        onError: () => {
            notifications.error('Failed to publish job');
        },
    });

    const closeMutation = useMutation({
        mutationFn: (id: number) => jobsService.close(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            notifications.success('Job closed successfully');
        },
        onError: () => {
            notifications.error('Failed to close job');
        },
    });

    const reopenMutation = useMutation({
        mutationFn: (id: number) => jobsService.reopen(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            notifications.success('Job reopened successfully');
        },
        onError: () => {
            notifications.error('Failed to reopen job');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => jobsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            notifications.success('Job deleted successfully');
            closeDeleteConfirm();
        },
        onError: () => {
            notifications.error('Failed to delete job');
        },
    });

    // Table columns
    const columns = [
        { key: 'title', label: 'Job Title' },
        { key: 'department', label: 'Department' },
        { key: 'location', label: 'Location' },
        { key: 'status', label: 'Status' },
        { key: 'application_count', label: 'Applications' },
        { key: 'published_at', label: 'Posted' },
        { key: 'expires_at', label: 'Expires' },
        { key: 'actions', label: 'Actions', headerClass: 'text-right' },
    ];

    // Methods
    function setFilter(filter: JobFilter) {
        currentFilter.value = filter;
        page.value = 1;
    }

    function handlePageChange(newPage: number) {
        page.value = newPage;
    }

    function handleRowClick(job: JobResponse) {
        router.push(`/jobs/${job.id}/applications`);
    }

    function openCreateModal() {
        editingJob.value = null;
        showJobModal.value = true;
    }

    function openEditModal(job: JobResponse, event: Event) {
        event.stopPropagation();
        editingJob.value = job;
        showJobModal.value = true;
    }

    function closeJobModal() {
        showJobModal.value = false;
        editingJob.value = null;
    }

    function openPreviewModal(job: JobResponse, event: Event) {
        event.stopPropagation();
        previewingJob.value = job;
        showPreviewModal.value = true;
    }

    function closePreviewModal() {
        showPreviewModal.value = false;
        previewingJob.value = null;
    }

    function handleSaveJob(data: JobCreate, publish: boolean) {
        if (editingJob.value) {
            updateMutation.mutate({ id: editingJob.value.id, data });
        } else {
            createMutation.mutate({ data, publish });
        }
    }

    function handlePublish(job: JobResponse, event: Event) {
        event.stopPropagation();
        publishMutation.mutate(job.id);
    }

    function handleClose(job: JobResponse, event: Event) {
        event.stopPropagation();
        closeMutation.mutate(job.id);
    }

    function handleReopen(job: JobResponse, event: Event) {
        event.stopPropagation();
        reopenMutation.mutate(job.id);
    }

    function openDeleteConfirm(job: JobResponse, event: Event) {
        event.stopPropagation();
        deletingJob.value = job;
        showDeleteConfirm.value = true;
    }

    function closeDeleteConfirm() {
        showDeleteConfirm.value = false;
        deletingJob.value = null;
    }

    function confirmDelete() {
        if (deletingJob.value) {
            deleteMutation.mutate(deletingJob.value.id);
        }
    }

    function getStatusVariant(job: JobResponse): 'success' | 'warning' | 'error' | 'gray' {
        if (job.is_expired) return 'warning';
        if (job.status === 'draft') return 'gray';
        if (job.status === 'published') return 'success';
        if (job.status === 'closed') return 'error';
        return 'gray';
    }

    function getStatusLabel(job: JobResponse): string {
        if (job.is_expired) return 'Expired';
        if (job.status === 'draft') return 'Draft';
        if (job.status === 'published') return 'Active';
        if (job.status === 'closed') return 'Closed';
        return job.status;
    }

    function formatDate(dateStr: string | null): string {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-AU', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }

    function formatExpiry(job: JobResponse): string {
        if (!job.expires_at) return 'Never';
        return formatDate(job.expires_at);
    }
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-semibold text-gray-900">Job Postings</h1>
            <button class="btn-primary" @click="openCreateModal">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Create Job
            </button>
        </div>

        <!-- Filter Tabs -->
        <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8">
                <button
                    class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
                    :class="
                        currentFilter === 'all'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    "
                    @click="setFilter('all')"
                >
                    All Jobs
                </button>
                <button
                    class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
                    :class="
                        currentFilter === 'active'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    "
                    @click="setFilter('active')"
                >
                    Active Only
                </button>
                <button
                    class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
                    :class="
                        currentFilter === 'expired'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    "
                    @click="setFilter('expired')"
                >
                    Expired/Closed
                </button>
            </nav>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center py-12">
            <Spinner size="lg" />
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="card p-6 text-center">
            <p class="text-red-600">Failed to load jobs</p>
        </div>

        <!-- Jobs Table -->
        <div v-else>
            <DataTable
                :columns="columns"
                :data="(jobs as unknown as Record<string, unknown>[])"
                :pagination="pagination"
                empty-message="No job postings found. Create your first job posting to start receiving applications."
                empty-icon="inbox"
                @page-change="handlePageChange"
            >
                <template #cell-title="{ row }">
                    <button
                        class="text-primary-600 hover:text-primary-800 font-medium text-left"
                        @click="handleRowClick(row as unknown as JobResponse)"
                    >
                        {{ (row as unknown as JobResponse).title }}
                    </button>
                </template>

                <template #cell-department="{ value }">
                    {{ value ?? '-' }}
                </template>

                <template #cell-location="{ value }">
                    {{ value ?? '-' }}
                </template>

                <template #cell-status="{ row }">
                    <Badge :variant="getStatusVariant(row as unknown as JobResponse)">
                        {{ getStatusLabel(row as unknown as JobResponse) }}
                    </Badge>
                </template>

                <template #cell-application_count="{ value }">
                    <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                        {{ value }}
                    </span>
                </template>

                <template #cell-published_at="{ value }">
                    {{ formatDate(value as string | null) }}
                </template>

                <template #cell-expires_at="{ row }">
                    <span :class="(row as unknown as JobResponse).is_expired ? 'text-orange-600 font-medium' : ''">
                        {{ formatExpiry(row as unknown as JobResponse) }}
                    </span>
                </template>

                <template #cell-actions="{ row }">
                    <div class="flex items-center justify-end gap-2">
                        <!-- Preview -->
                        <button
                            class="p-1 text-gray-400 hover:text-primary-600"
                            title="Preview"
                            @click="openPreviewModal(row as unknown as JobResponse, $event)"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>

                        <!-- Edit -->
                        <button
                            class="p-1 text-gray-400 hover:text-gray-600"
                            title="Edit"
                            @click="openEditModal(row as unknown as JobResponse, $event)"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>

                        <!-- Publish (for draft) -->
                        <button
                            v-if="(row as unknown as JobResponse).status === 'draft'"
                            class="p-1 text-green-500 hover:text-green-700"
                            title="Publish"
                            @click="handlePublish(row as unknown as JobResponse, $event)"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>

                        <!-- Close (for published) -->
                        <button
                            v-if="(row as unknown as JobResponse).status === 'published'"
                            class="p-1 text-orange-500 hover:text-orange-700"
                            title="Close"
                            @click="handleClose(row as unknown as JobResponse, $event)"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>

                        <!-- Reopen (for closed) -->
                        <button
                            v-if="(row as unknown as JobResponse).status === 'closed'"
                            class="p-1 text-blue-500 hover:text-blue-700"
                            title="Reopen"
                            @click="handleReopen(row as unknown as JobResponse, $event)"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>

                        <!-- Delete -->
                        <button
                            class="p-1 text-red-400 hover:text-red-600"
                            title="Delete"
                            @click="openDeleteConfirm(row as unknown as JobResponse, $event)"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </template>
            </DataTable>
        </div>

        <!-- Job Form Modal -->
        <JobFormModal
            :is-open="showJobModal"
            :job="editingJob"
            @close="closeJobModal"
            @save="handleSaveJob"
        />

        <!-- Delete Confirmation -->
        <ConfirmDialog
            :is-open="showDeleteConfirm"
            title="Delete Job Posting"
            :message="`Are you sure you want to delete '${deletingJob?.title}'? This will also delete all applications for this job. This action cannot be undone.`"
            confirm-text="Delete"
            variant="danger"
            :loading="deleteMutation.isPending.value"
            @confirm="confirmDelete"
            @cancel="closeDeleteConfirm"
        />

        <!-- Job Preview -->
        <JobPreviewModal
            :is-open="showPreviewModal"
            :job="previewingJob"
            @close="closePreviewModal"
        />
    </div>
</template>
