<script setup lang="ts" generic="T extends Record<string, unknown>">
    import { computed, useSlots } from 'vue';
    import EmptyState from './EmptyState.vue';
    import Spinner from './Spinner.vue';

    export interface Column<T> {
        key: keyof T | string;
        label: string;
        sortable?: boolean;
        class?: string;
        headerClass?: string;
    }

    export interface PaginationInfo {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    }

    type EmptyIconType = 'inbox' | 'document' | 'users' | 'search';

    interface Props {
        columns: Column<T>[];
        data: T[];
        loading?: boolean;
        emptyMessage?: string;
        emptyIcon?: EmptyIconType;
        rowKey?: string;
        pagination?: PaginationInfo;
    }

    const props = withDefaults(defineProps<Props>(), {
        loading: false,
        emptyMessage: 'No data available',
        emptyIcon: 'inbox',
        rowKey: 'id',
        pagination: undefined,
    });

    const emit = defineEmits<{
        pageChange: [page: number];
    }>();

    defineSlots<{
        [key: `cell-${string}`]: (props: { row: T; value: unknown }) => unknown;
        actions?: (props: { row: T }) => unknown;
        empty?: () => unknown;
    }>();

    const slots = useSlots();

    const hasActions = computed(() => {
        return !!slots.actions;
    });

    const hasPagination = computed(() => {
        return props.pagination && props.pagination.totalPages > 1;
    });

    const paginationRange = computed(() => {
        if (!props.pagination) return [];
        const { page, totalPages } = props.pagination;
        const range: (number | string)[] = [];
        const delta = 2;
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
                range.push(i);
            } else if (range[range.length - 1] !== '...') {
                range.push('...');
            }
        }
        return range;
    });

    const showingFrom = computed(() => {
        if (!props.pagination) return 0;
        return (props.pagination.page - 1) * props.pagination.pageSize + 1;
    });

    const showingTo = computed(() => {
        if (!props.pagination) return 0;
        return Math.min(props.pagination.page * props.pagination.pageSize, props.pagination.total);
    });

    function getCellValue(row: T, key: string): unknown {
        const keys = key.split('.');
        let value: unknown = row;
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = (value as Record<string, unknown>)[k];
            } else {
                return undefined;
            }
        }
        return value;
    }

    function goToPage(page: number | string) {
        if (typeof page === 'string') return;
        if (!props.pagination) return;
        if (page < 1 || page > props.pagination.totalPages) return;
        emit('pageChange', page);
    }
</script>

<template>
    <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <!-- Loading overlay -->
        <div v-if="loading" class="flex items-center justify-center py-12">
            <Spinner size="lg" />
        </div>

        <!-- Empty state -->
        <template v-else-if="data.length === 0">
            <slot name="empty">
                <EmptyState :message="emptyMessage" :icon="emptyIcon" />
            </slot>
        </template>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th
                            v-for="column in columns"
                            :key="String(column.key)"
                            class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            :class="column.headerClass"
                        >
                            {{ column.label }}
                        </th>
                        <th
                            v-if="hasActions"
                            class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr
                        v-for="row in data"
                        :key="String((row as Record<string, unknown>)[rowKey])"
                        class="hover:bg-gray-50 transition-colors"
                    >
                        <td
                            v-for="column in columns"
                            :key="String(column.key)"
                            class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                            :class="column.class"
                        >
                            <slot
                                :name="`cell-${String(column.key)}`"
                                :row="row"
                                :value="getCellValue(row, String(column.key))"
                            >
                                {{ getCellValue(row, String(column.key)) ?? '-' }}
                            </slot>
                        </td>
                        <td
                            v-if="hasActions"
                            class="px-4 py-3 text-sm text-right whitespace-nowrap"
                        >
                            <slot name="actions" :row="row" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div
            v-if="hasPagination && pagination"
            class="px-4 py-3 border-t border-gray-200 flex items-center justify-between"
        >
            <div class="text-sm text-gray-500">
                Showing {{ showingFrom }} to {{ showingTo }} of {{ pagination.total }} results
            </div>
            <nav class="flex items-center gap-1">
                <!-- Previous button -->
                <button
                    class="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    :disabled="!pagination.hasPrev"
                    @click="goToPage(pagination.page - 1)"
                >
                    Previous
                </button>
                
                <!-- Page numbers -->
                <template v-for="pageNum in paginationRange" :key="pageNum">
                    <span
                        v-if="pageNum === '...'"
                        class="px-3 py-1.5 text-sm text-gray-500"
                    >
                        ...
                    </span>
                    <button
                        v-else
                        class="px-3 py-1.5 text-sm rounded-md border"
                        :class="pageNum === pagination.page 
                            ? 'bg-primary-600 text-white border-primary-600' 
                            : 'border-gray-300 hover:bg-gray-50'"
                        @click="goToPage(pageNum)"
                    >
                        {{ pageNum }}
                    </button>
                </template>
                
                <!-- Next button -->
                <button
                    class="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    :disabled="!pagination.hasNext"
                    @click="goToPage(pagination.page + 1)"
                >
                    Next
                </button>
            </nav>
        </div>
    </div>
</template>
