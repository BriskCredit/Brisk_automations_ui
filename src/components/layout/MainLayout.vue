<script setup lang="ts">
    import { ref } from 'vue';
    import Sidebar from './Sidebar.vue';
    import Header from './Header.vue';

    const sidebarOpen = ref(true);

    function toggleSidebar() {
        sidebarOpen.value = !sidebarOpen.value;
    }
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Sidebar -->
        <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

        <!-- Main content area -->
        <div class="transition-all duration-300" :class="sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'">
            <!-- Header -->
            <Header :sidebar-open="sidebarOpen" @toggle-sidebar="toggleSidebar" />

            <!-- Page content -->
            <main class="py-6 px-4 sm:px-6 lg:px-8">
                <slot />
            </main>
        </div>
    </div>
</template>
