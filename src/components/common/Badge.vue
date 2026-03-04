<script setup lang="ts">
    interface Props {
        variant?: 'success' | 'error' | 'warning' | 'info' | 'gray';
        size?: 'sm' | 'md';
        dot?: boolean;
    }

    withDefaults(defineProps<Props>(), {
        variant: 'gray',
        size: 'md',
        dot: false,
    });

    const variantClasses = {
        success: 'bg-green-100 text-green-800',
        error: 'bg-red-100 text-red-800',
        warning: 'bg-yellow-100 text-yellow-800',
        info: 'bg-blue-100 text-blue-800',
        gray: 'bg-gray-100 text-gray-800',
    };

    const dotColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500',
        gray: 'bg-gray-500',
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
    };
</script>

<template>
    <span
        class="inline-flex items-center font-medium rounded-full"
        :class="[variantClasses[variant], sizeClasses[size]]"
    >
        <span v-if="dot" class="w-1.5 h-1.5 rounded-full mr-1.5" :class="dotColors[variant]" />
        <slot />
    </span>
</template>
