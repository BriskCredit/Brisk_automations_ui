<script setup lang="ts">
    import { useRoute, useRouter } from 'vue-router';
    import { computed, ref } from 'vue';
    import { useAuthStore } from '@/stores';

    interface Props {
        sidebarOpen: boolean;
    }

    defineProps<Props>();
    defineEmits<{
        toggleSidebar: [];
    }>();

    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();

    const showUserMenu = ref(false);

    const pageTitle = computed(() => {
        return (route.meta?.title as string) || 'Dashboard';
    });

    const userName = computed(() => {
        return authStore.user?.name || authStore.user?.email || 'Admin';
    });

    function handleLogout() {
        authStore.logout();
        router.push('/login');
    }
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

            <!-- Right side - User menu -->
            <div class="relative flex items-center gap-4">
                <button
                    class="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none"
                    @click="showUserMenu = !showUserMenu"
                >
                    <span class="hidden sm:inline">{{ userName }}</span>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </button>

                <!-- Dropdown menu -->
                <div
                    v-if="showUserMenu"
                    class="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                    @click="showUserMenu = false"
                >
                    <div class="px-4 py-2 border-b border-gray-100">
                        <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
                        <p class="text-xs text-gray-500">{{ authStore.user?.email }}</p>
                    </div>
                    <button
                        class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        @click="handleLogout"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                        </svg>
                        Sign out
                    </button>
                </div>
            </div>
        </div>

        <!-- Click outside to close menu -->
        <div
            v-if="showUserMenu"
            class="fixed inset-0 z-[-1]"
            @click="showUserMenu = false"
        />
    </header>
</template>
