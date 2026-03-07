<script setup lang="ts">
    import { ref, computed } from 'vue';
    import { useRoute } from 'vue-router';

    interface Props {
        isOpen: boolean;
    }

    defineProps<Props>();
    defineEmits<{
        close: [];
    }>();

    const route = useRoute();
    const reportsExpanded = ref(true);

    interface NavItem {
        name: string;
        path: string;
        icon: string;
        children?: NavItem[];
    }

    const navigation: NavItem[] = [
        {
            name: 'Dashboard',
            path: '/',
            icon: 'home',
        },
        {
            name: 'Reports',
            path: '/reports',
            icon: 'document',
            children: [
                { name: 'Customer Calls', path: '/reports/customer-calls', icon: 'phone' },
                { name: 'Customer Visit', path: '/reports/customer-visit', icon: 'users' },
            ],
        },
        {
            name: 'Job Applications',
            path: '/jobs',
            icon: 'briefcase',
        },
        {
            name: 'Invites',
            path: '/invites',
            icon: 'mail',
        },
    ];

    function isActive(path: string): boolean {
        if (path === '/') {
            return route.path === '/';
        }
        return route.path.startsWith(path);
    }

    function toggleReports() {
        reportsExpanded.value = !reportsExpanded.value;
    }

    const iconPaths = computed(() => ({
        home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
        document:
            'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
        users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        briefcase:
            'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        cog: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
        mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        chevronDown: 'M19 9l-7 7-7-7',
        chevronRight: 'M9 5l7 7-7 7',
    }));
</script>

<template>
    <!-- Mobile backdrop -->
    <div
        v-if="isOpen"
        class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
        @click="$emit('close')"
    />

    <!-- Sidebar -->
    <aside
        class="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out"
        :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
    >
        <!-- Logo -->
        <div class="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <h1 class="text-xl font-bold text-primary-600">Brisk Automations</h1>
        </div>

        <!-- Navigation -->
        <nav class="mt-4 px-3 space-y-1">
            <template v-for="item in navigation" :key="item.path">
                <!-- Item with children (Reports) -->
                <template v-if="item.children">
                    <button
                        class="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                        :class="
                            isActive(item.path)
                                ? 'bg-primary-50 text-primary-700'
                                : 'text-gray-700 hover:bg-gray-100'
                        "
                        @click="toggleReports"
                    >
                        <div class="flex items-center gap-3">
                            <svg
                                class="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    :d="iconPaths[item.icon as keyof typeof iconPaths]"
                                />
                            </svg>
                            {{ item.name }}
                        </div>
                        <svg
                            class="w-4 h-4 transition-transform"
                            :class="reportsExpanded ? 'rotate-0' : '-rotate-90'"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                :d="iconPaths.chevronDown"
                            />
                        </svg>
                    </button>

                    <!-- Children -->
                    <div v-show="reportsExpanded" class="ml-4 mt-1 space-y-1">
                        <RouterLink
                            v-for="child in item.children"
                            :key="child.path"
                            :to="child.path"
                            class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                            :class="
                                isActive(child.path)
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                            "
                        >
                            <svg
                                class="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    :d="iconPaths[child.icon as keyof typeof iconPaths]"
                                />
                            </svg>
                            {{ child.name }}
                        </RouterLink>
                    </div>
                </template>

                <!-- Regular nav item -->
                <template v-else>
                    <RouterLink
                        :to="item.path"
                        class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                        :class="
                            isActive(item.path)
                                ? 'bg-primary-50 text-primary-700'
                                : 'text-gray-700 hover:bg-gray-100'
                        "
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                :d="iconPaths[item.icon as keyof typeof iconPaths]"
                            />
                        </svg>
                        {{ item.name }}
                    </RouterLink>
                </template>
            </template>
        </nav>
    </aside>
</template>
