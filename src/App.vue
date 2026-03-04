<script setup lang="ts">
    import MainLayout from '@/components/layout/MainLayout.vue';
    import Toast from '@/components/common/Toast.vue';
</script>

<template>
    <MainLayout>
        <RouterView />
    </MainLayout>
    <Toast />
</template>
