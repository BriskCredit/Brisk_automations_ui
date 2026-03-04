<script setup lang="ts">
    interface Props {
        message?: string;
        description?: string;
        icon?: 'inbox' | 'document' | 'users' | 'search';
    }

    withDefaults(defineProps<Props>(), {
        message: 'No data found',
        description: '',
        icon: 'inbox',
    });

    const iconPaths = {
        inbox: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
        document:
            'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    };
</script>

<template>
    <div class="flex flex-col items-center justify-center py-12 px-4">
        <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg
                class="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    :d="iconPaths[icon]"
                />
            </svg>
        </div>
        <p class="text-sm font-medium text-gray-900">{{ message }}</p>
        <p v-if="description" class="mt-1 text-sm text-gray-500">{{ description }}</p>
        <div v-if="$slots.action" class="mt-4">
            <slot name="action" />
        </div>
    </div>
</template>
