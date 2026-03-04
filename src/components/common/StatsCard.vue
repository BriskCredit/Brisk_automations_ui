<script setup lang="ts">
    import Spinner from './Spinner.vue';

    interface Props {
        title: string;
        value: string | number;
        subtitle?: string;
        icon?: 'document' | 'users' | 'file' | 'chart';
        loading?: boolean;
        trend?: {
            value: number;
            label: string;
            positive?: boolean;
        };
    }

    withDefaults(defineProps<Props>(), {
        subtitle: '',
        icon: 'chart',
        loading: false,
    });

    const iconPaths = {
        document:
            'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        file: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
        chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    };
</script>

<template>
    <div class="card p-6">
        <div class="flex items-start justify-between">
            <div class="flex-1">
                <p class="text-sm font-medium text-gray-500">{{ title }}</p>
                <div class="mt-2">
                    <Spinner v-if="loading" size="sm" />
                    <p v-else class="text-3xl font-semibold text-gray-900">{{ value }}</p>
                </div>
                <p v-if="subtitle && !loading" class="mt-1 text-sm text-gray-500">
                    {{ subtitle }}
                </p>
                <div v-if="trend && !loading" class="mt-2 flex items-center text-sm">
                    <span
                        :class="trend.positive ? 'text-green-600' : 'text-red-600'"
                        class="font-medium"
                    >
                        {{ trend.positive ? '+' : '' }}{{ trend.value }}%
                    </span>
                    <span class="ml-2 text-gray-500">{{ trend.label }}</span>
                </div>
            </div>
            <div
                class="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center"
            >
                <svg
                    class="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        :d="iconPaths[icon]"
                    />
                </svg>
            </div>
        </div>
    </div>
</template>
