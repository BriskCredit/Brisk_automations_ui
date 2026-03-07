<script setup lang="ts">
    import { computed } from 'vue';
    import { useRoute } from 'vue-router';
    import MainLayout from '@/components/layout/MainLayout.vue';
    import Toast from '@/components/common/Toast.vue';

    const route = useRoute();

    const isAuthPage = computed(() => route.meta?.authPage === true);
</script>

<template>
    <!-- Auth pages (login/signup) don't use the main layout -->
    <template v-if="isAuthPage">
        <RouterView />
    </template>
    <!-- Protected pages use the main layout -->
    <MainLayout v-else>
        <RouterView />
    </MainLayout>
    <Toast />
</template>
