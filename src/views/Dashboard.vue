<script setup lang="ts">
    import { computed } from 'vue';
    import { useQuery } from '@tanstack/vue-query';
    import { reportTypesService, recipientsService, filesService } from '@/api/services';
    import { StatsCard } from '@/components/common';
    import type { ReportTypeResponse } from '@/types';

    // Fetch report types
    const {
        data: reportTypes,
        isLoading: reportTypesLoading,
        error: reportTypesError,
    } = useQuery({
        queryKey: ['reportTypes'],
        queryFn: () => reportTypesService.getAll(),
    });

    // Fetch recipients
    const {
        data: recipients,
        isLoading: recipientsLoading,
        error: recipientsError,
    } = useQuery({
        queryKey: ['recipients'],
        queryFn: () => recipientsService.getAll(),
    });

    // Fetch recent files
    const {
        data: files,
        isLoading: filesLoading,
        error: filesError,
    } = useQuery({
        queryKey: ['files', { page_size: 5 }],
        queryFn: () => filesService.getAll({ page_size: 5 }),
    });

    // Computed stats
    const reportTypeStats = computed(() => {
        const items = reportTypes.value?.items;
        if (!items) return { total: 0, active: 0, inactive: 0 };
        const active = items.filter((r: ReportTypeResponse) => r.is_active).length;
        return {
            total: items.length,
            active,
            inactive: items.length - active,
        };
    });

    const recipientCount = computed(() => recipients.value?.items?.length ?? 0);

    const recentFiles = computed(() => files.value?.items ?? []);

    // Format date helper
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

    // Format file size helper
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
</script>

<template>
    <div class="space-y-6">
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatsCard
                title="Report Types"
                :value="reportTypeStats.total"
                :subtitle="`${reportTypeStats.active} active, ${reportTypeStats.inactive} inactive`"
                icon="document"
                :loading="reportTypesLoading"
            />

            <StatsCard
                title="Total Recipients"
                :value="recipientCount"
                subtitle="Email recipients configured"
                icon="users"
                :loading="recipientsLoading"
            />

            <StatsCard
                title="Recent Files"
                :value="recentFiles.length"
                subtitle="Generated in recent period"
                icon="file"
                :loading="filesLoading"
            />
        </div>

        <!-- Error States -->
        <div v-if="reportTypesError || recipientsError || filesError" class="card p-4">
            <p class="text-sm text-red-600">
                Error loading dashboard data. Please check your connection and try again.
            </p>
        </div>

        <!-- Recent Files Table -->
        <div class="card">
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-semibold text-gray-900">Recent Generated Files</h2>
            </div>

            <div v-if="filesLoading" class="p-6 text-center">
                <p class="text-gray-500">Loading files...</p>
            </div>

            <div v-else-if="recentFiles.length === 0" class="p-6 text-center">
                <p class="text-gray-500">No files generated yet.</p>
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
                        <tr
                            v-for="file in recentFiles"
                            :key="file.id"
                            class="hover:bg-gray-50"
                        >
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <svg
                                        class="w-5 h-5 text-gray-400 mr-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <span class="text-sm text-gray-900">{{ file.filename }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ formatFileSize(file.file_size) }}
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
            </div>
        </div>

        <!-- Quick Access -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RouterLink
                to="/reports/customer-calls"
                class="card p-6 hover:shadow-md transition-shadow group"
            >
                <div class="flex items-center gap-4">
                    <div
                        class="w-12 h-12 rounded-lg bg-secondary-50 flex items-center justify-center group-hover:bg-secondary-100 transition-colors"
                    >
                        <svg
                            class="w-6 h-6 text-secondary-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">Customer Calls Report</h3>
                        <p class="text-sm text-gray-500">View status, preview, and run report</p>
                    </div>
                </div>
            </RouterLink>

            <RouterLink
                to="/reports/customer-visit"
                class="card p-6 hover:shadow-md transition-shadow group"
            >
                <div class="flex items-center gap-4">
                    <div
                        class="w-12 h-12 rounded-lg bg-secondary-50 flex items-center justify-center group-hover:bg-secondary-100 transition-colors"
                    >
                        <svg
                            class="w-6 h-6 text-secondary-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">Customer Visit Report</h3>
                        <p class="text-sm text-gray-500">View status, preview, and run report</p>
                    </div>
                </div>
            </RouterLink>
        </div>
    </div>
</template>
