<script setup lang="ts">
    import { watch, onMounted, onUnmounted } from 'vue';

    interface Props {
        isOpen: boolean;
        title?: string;
        size?: 'sm' | 'md' | 'lg' | 'xl';
        position?: 'left' | 'right';
        closeOnBackdrop?: boolean;
    }

    const props = withDefaults(defineProps<Props>(), {
        title: '',
        size: 'md',
        position: 'right',
        closeOnBackdrop: true,
    });

    const emit = defineEmits<{
        close: [];
    }>();

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };

    function handleBackdropClick() {
        if (props.closeOnBackdrop) {
            emit('close');
        }
    }

    function handleEscape(e: KeyboardEvent) {
        if (e.key === 'Escape' && props.isOpen) {
            emit('close');
        }
    }

    watch(
        () => props.isOpen,
        (isOpen) => {
            if (isOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    );

    onMounted(() => {
        document.addEventListener('keydown', handleEscape);
    });

    onUnmounted(() => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
    });
</script>

<template>
    <Teleport to="body">
        <Transition name="drawer">
            <div v-if="isOpen" class="fixed inset-0 z-50 flex">
                <!-- Backdrop -->
                <div
                    class="fixed inset-0 bg-black/50 transition-opacity"
                    @click="handleBackdropClick"
                />

                <!-- Drawer panel -->
                <div
                    class="relative ml-auto flex h-full w-full flex-col bg-white shadow-xl transition-transform"
                    :class="[
                        sizeClasses[size],
                        position === 'left' ? 'mr-auto ml-0' : 'ml-auto mr-0',
                    ]"
                >
                    <!-- Header -->
                    <div
                        class="flex items-center justify-between px-6 py-4 border-b border-gray-200"
                    >
                        <slot name="header">
                            <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
                        </slot>
                        <button
                            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                            @click="emit('close')"
                        >
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
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    <!-- Body -->
                    <div class="flex-1 overflow-y-auto px-6 py-4">
                        <slot />
                    </div>

                    <!-- Footer -->
                    <div
                        v-if="$slots.footer"
                        class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50"
                    >
                        <slot name="footer" />
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
    .drawer-enter-active,
    .drawer-leave-active {
        transition: opacity 0.3s ease;
    }

    .drawer-enter-from,
    .drawer-leave-to {
        opacity: 0;
    }

    .drawer-enter-active > div:last-child,
    .drawer-leave-active > div:last-child {
        transition: transform 0.3s ease;
    }

    .drawer-enter-from > div:last-child {
        transform: translateX(100%);
    }

    .drawer-leave-to > div:last-child {
        transform: translateX(100%);
    }
</style>
