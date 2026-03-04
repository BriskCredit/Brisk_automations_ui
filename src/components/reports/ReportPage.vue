<script setup lang="ts">
    import { ref, computed } from 'vue';
    import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
    import { filesService } from '@/api/services';
    import { useNotificationStore } from '@/stores';
    import { Badge, Spinner, Modal, ConfirmDialog } from '@/components/common';
    import RecipientsDrawer from './RecipientsDrawer.vue';
    import type {
        StatusResponse,
        PreviewResponse,
        RunResponse,
        RunRequest,
    } from '@/types';

    interface Props {
        reportTypeCode: string;
        reportTypeName: string;
        // Service methods passed as props for flexibility
        getStatus: () => Promise<StatusResponse>;
        getPreview: () => Promise<PreviewResponse>;
        runReport: (data?: RunRequest) => Promise<RunResponse>;
        toggleReport: (isActive: boolean) => Promise<StatusResponse>;
    }

    const props = defineProps<Props>();

    const queryClient = useQueryClient();
    const notifications = useNotificationStore();

    // UI State
    const showRecipientsDrawer = ref(false);
    const showPreviewModal = ref(false);
    const showRunConfirm = ref(false);
    const showOverrideModal = ref(false);
    const overrideRecipients = ref('');
    const filesPage = ref(1);
    const filesPageSize = ref(5);

    // Fetch status
    const {
        data: status,
        isLoading: statusLoading,
        error: statusError,
        refetch: refetchStatus,
    } = useQuery({
        queryKey: ['reportStatus', props.reportTypeCode],
        queryFn: props.getStatus,
    });

    // Fetch preview (lazy - only when modal opens)
    const {
        data: preview,
        isLoading: previewLoading,
        error: previewError,
        refetch: fetchPreview,
    } = useQuery({
        queryKey: ['reportPreview', props.reportTypeCode],
        queryFn: props.getPreview,
        enabled: false, // Manual trigger
    });

    // Fetch files
    const {
        data: filesResponse,
        isLoading: filesLoading,
    } = useQuery({
        queryKey: computed(() => ['files', { report_type_code: props.reportTypeCode, page: filesPage.value, page_size: filesPageSize.value }]),
        queryFn: () => filesService.getAll({ report_type_code: props.reportTypeCode, page: filesPage.value, page_size: filesPageSize.value }),
    });

    // Computed for files data
    const files = computed(() => filesResponse.value?.items ?? []);
    const filesPagination = computed(() => {
        if (!filesResponse.value) return undefined;
        return {
            page: filesResponse.value.page,
            pageSize: filesResponse.value.page_size,
            total: filesResponse.value.total,
            totalPages: filesResponse.value.total_pages,
            hasNext: filesResponse.value.has_next,
            hasPrev: filesResponse.value.has_prev,
        };
    });

    // Toggle mutation
    const toggleMutation = useMutation({
        mutationFn: (isActive: boolean) => props.toggleReport(isActive),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['reportStatus', props.reportTypeCode] });
            queryClient.invalidateQueries({ queryKey: ['reportTypes'] });
            notifications.success(`Report ${data.is_active ? 'activated' : 'deactivated'}`);
        },
        onError: () => {
            notifications.error('Failed to toggle report status');
        },
    });

    // Run report mutation
    const runMutation = useMutation({
        mutationFn: (data?: RunRequest) => props.runReport(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['files'] });
            if (data.success) {
                notifications.success(data.message || 'Report generated successfully');
            } else {
                notifications.warning(data.message || 'Report completed with warnings');
            }
            showRunConfirm.value = false;
            showOverrideModal.value = false;
            overrideRecipients.value = '';
        },
        onError: () => {
            notifications.error('Failed to run report');
        },
    });

    // Computed
    const recipientsSummary = computed(() => {
        if (!status.value) return { to: 0, cc: 0, bcc: 0 };
        const recipients = status.value.recipients;
        return {
            to: recipients.filter((r) => r.type === 'to').length,
            cc: recipients.filter((r) => r.type === 'cc').length,
            bcc: recipients.filter((r) => r.type === 'bcc').length,
        };
    });

    // Methods
    async function handlePreview() {
        showPreviewModal.value = true;
        await fetchPreview();
    }

    function handleToggle() {
        if (!status.value) return;
        toggleMutation.mutate(!status.value.is_active);
    }

    function handleRun() {
        showRunConfirm.value = true;
    }

    function confirmRun() {
        runMutation.mutate(undefined);
    }

    function handleRunWithOverride() {
        showOverrideModal.value = true;
    }

    function confirmRunWithOverride() {
        const emails = overrideRecipients.value
            .split(/[,\n]/)
            .map((e) => e.trim())
            .filter((e) => e);
        if (emails.length === 0) {
            notifications.warning('Please enter at least one email address');
            return;
        }
        runMutation.mutate({ override_recipients: emails });
    }

    function formatDate(dateStr: string | null): string {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    function formatFileSize(bytes: number | null): string {
        if (!bytes) return '-';
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }

    function handleFilesPageChange(page: number) {
        filesPage.value = page;
    }
</script>

<template>
    <div class="space-y-6">
        <!-- Status Card -->
        <div class="card">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900">Report Status</h2>
                <div v-if="status" class="flex items-center gap-3">
                    <Badge :variant="status.is_active ? 'success' : 'gray'" dot>
                        {{ status.is_active ? 'Active' : 'Inactive' }}
                    </Badge>
                    <button
                        class="text-sm text-primary-600 hover:text-primary-800 font-medium"
                        :disabled="toggleMutation.isPending.value"
                        @click="handleToggle"
                    >
                        {{ status.is_active ? 'Deactivate' : 'Activate' }}
                    </button>
                </div>
            </div>

            <div v-if="statusLoading" class="px-6 py-8 flex justify-center">
                <Spinner size="lg" />
            </div>

            <div v-else-if="statusError" class="px-6 py-8 text-center">
                <p class="text-red-600">Failed to load status</p>
                <button class="btn-secondary mt-4" @click="() => refetchStatus()">Retry</button>
            </div>

            <div v-else-if="status" class="px-6 py-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Recipients Summary -->
                    <div>
                        <p class="text-sm text-gray-500 mb-2">Recipients</p>
                        <div class="flex items-center gap-4">
                            <div class="text-center">
                                <p class="text-2xl font-semibold text-gray-900">
                                    {{ recipientsSummary.to }}
                                </p>
                                <p class="text-xs text-gray-500">TO</p>
                            </div>
                            <div class="text-center">
                                <p class="text-2xl font-semibold text-gray-900">
                                    {{ recipientsSummary.cc }}
                                </p>
                                <p class="text-xs text-gray-500">CC</p>
                            </div>
                            <div class="text-center">
                                <p class="text-2xl font-semibold text-gray-900">
                                    {{ recipientsSummary.bcc }}
                                </p>
                                <p class="text-xs text-gray-500">BCC</p>
                            </div>
                        </div>
                        <button
                            class="mt-3 text-sm text-primary-600 hover:text-primary-800 font-medium"
                            @click="showRecipientsDrawer = true"
                        >
                            Manage Recipients
                        </button>
                    </div>

                    <!-- Actions -->
                    <div class="md:col-span-2">
                        <p class="text-sm text-gray-500 mb-3">Actions</p>
                        <div class="flex flex-wrap gap-3">
                            <button class="btn-secondary" @click="handlePreview">
                                <svg
                                    class="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                                Preview Data
                            </button>
                            <button
                                class="btn-primary"
                                :disabled="runMutation.isPending.value"
                                @click="handleRun"
                            >
                                <Spinner
                                    v-if="runMutation.isPending.value"
                                    size="sm"
                                    color="white"
                                    class="mr-2"
                                />
                                <svg
                                    v-else
                                    class="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                    />
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                Run Report
                            </button>
                            <button class="btn-secondary" @click="handleRunWithOverride">
                                <svg
                                    class="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                                Run with Override
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Generated Files -->
        <div class="card">
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-semibold text-gray-900">Generated Files</h2>
            </div>

            <div v-if="filesLoading" class="px-6 py-8 flex justify-center">
                <Spinner size="lg" />
            </div>

            <div v-else-if="!files?.length" class="px-6 py-8 text-center">
                <p class="text-gray-500">No files generated yet</p>
            </div>

            <div v-else class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Filename
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Size
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Report Date
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Created
                            </th>
                            <th
                                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="file in files" :key="file.id" class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <svg
                                        class="w-5 h-5 text-green-500 mr-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    <span class="text-sm text-gray-900">{{ file.filename }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ formatFileSize(file.file_size) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ formatDate(file.report_date) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ formatDate(file.created_at) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right">
                                <a
                                    :href="file.file_url"
                                    target="_blank"
                                    class="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                >
                                    Download
                                </a>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Files Pagination -->
                <div
                    v-if="filesPagination && filesPagination.totalPages > 1"
                    class="px-6 py-3 border-t border-gray-200 flex items-center justify-between"
                >
                    <div class="text-sm text-gray-500">
                        Showing {{ (filesPagination.page - 1) * filesPagination.pageSize + 1 }} to 
                        {{ Math.min(filesPagination.page * filesPagination.pageSize, filesPagination.total) }} 
                        of {{ filesPagination.total }} files
                    </div>
                    <nav class="flex items-center gap-1">
                        <button
                            class="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            :disabled="!filesPagination.hasPrev"
                            @click="handleFilesPageChange(filesPagination.page - 1)"
                        >
                            Previous
                        </button>
                        <span class="px-3 py-1.5 text-sm text-gray-700">
                            Page {{ filesPagination.page }} of {{ filesPagination.totalPages }}
                        </span>
                        <button
                            class="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            :disabled="!filesPagination.hasNext"
                            @click="handleFilesPageChange(filesPagination.page + 1)"
                        >
                            Next
                        </button>
                    </nav>
                </div>
            </div>
        </div>

        <!-- Recipients Drawer -->
        <RecipientsDrawer
            :is-open="showRecipientsDrawer"
            :report-type-code="reportTypeCode"
            :report-type-name="reportTypeName"
            @close="showRecipientsDrawer = false"
        />

        <!-- Preview Modal -->
        <Modal
            :is-open="showPreviewModal"
            title="Report Preview"
            size="xl"
            @close="showPreviewModal = false"
        >
            <div v-if="previewLoading" class="flex justify-center py-8">
                <Spinner size="lg" />
            </div>

            <div v-else-if="previewError" class="text-center py-8">
                <p class="text-red-600">Failed to load preview</p>
            </div>

            <div v-else-if="preview" class="space-y-4">
                <div class="flex items-center justify-between text-sm text-gray-500">
                    <span>Generated: {{ formatDate(preview.generated_at) }}</span>
                    <span>{{ preview.row_count }} rows</span>
                </div>

                <div class="overflow-x-auto max-h-96">
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                        <thead class="bg-gray-50 sticky top-0">
                            <tr>
                                <th
                                    v-for="col in preview.columns"
                                    :key="col"
                                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                                >
                                    {{ col }}
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <tr v-for="(row, idx) in preview.summary" :key="idx">
                                <td
                                    v-for="col in preview.columns"
                                    :key="col"
                                    class="px-3 py-2 whitespace-nowrap text-gray-700"
                                >
                                    {{ row[col] ?? '-' }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <template #footer>
                <button class="btn-secondary" @click="showPreviewModal = false">Close</button>
            </template>
        </Modal>

        <!-- Run Confirmation -->
        <ConfirmDialog
            :is-open="showRunConfirm"
            title="Run Report"
            message="This will generate and send the report to all configured recipients. Continue?"
            confirm-text="Run Report"
            variant="info"
            :loading="runMutation.isPending.value"
            @confirm="confirmRun"
            @cancel="showRunConfirm = false"
        />

        <!-- Override Recipients Modal -->
        <Modal
            :is-open="showOverrideModal"
            title="Run with Override Recipients"
            @close="showOverrideModal = false"
        >
            <div class="space-y-4">
                <p class="text-sm text-gray-600">
                    Enter email addresses to send the report to instead of the configured
                    recipients. Separate multiple emails with commas or new lines.
                </p>
                <div>
                    <label class="label">Override Recipients</label>
                    <textarea
                        v-model="overrideRecipients"
                        class="input"
                        rows="4"
                        placeholder="email1@example.com&#10;email2@example.com"
                    />
                </div>
            </div>
            <template #footer>
                <button class="btn-secondary" @click="showOverrideModal = false">Cancel</button>
                <button
                    class="btn-primary"
                    :disabled="runMutation.isPending.value"
                    @click="confirmRunWithOverride"
                >
                    <Spinner
                        v-if="runMutation.isPending.value"
                        size="sm"
                        color="white"
                        class="mr-2"
                    />
                    Run Report
                </button>
            </template>
        </Modal>
    </div>
</template>
