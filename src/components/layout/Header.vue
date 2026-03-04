<script setup lang="ts">
    import { useRoute } from 'vue-router';
    import { computed } from 'vue';

    interface Props {
        sidebarOpen: boolean;
    }

    defineProps<Props>();
    defineEmits<{
        toggleSidebar: [];
    }>();

    const route = useRoute();

    const pageTitle = computed(() => {
        return (route.meta?.title as string) || 'Dashboard';
    });
</script>

<template>
    <header class="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <!-- Left side -->
            <div class="flex items-center gap-4">
                <!-- Menu toggle button -->
                <button
                    class="p-2 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    @click="$emit('toggleSidebar')"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            v-if="sidebarOpen"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                        />
                        <path
                            v-else
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>

                <!-- Page title -->
                <h1 class="text-xl font-semibold text-gray-900">{{ pageTitle }}</h1>
            </div>

            <!-- Right side - can add user menu, notifications etc later -->
            <div class="flex items-center gap-4">
                <span class="text-sm text-gray-500">Admin</span>
            </div>
        </div>
    </header>
</template>
