<script setup lang="ts">
    import { watch, onMounted, onUnmounted } from 'vue';

    interface Props {
        isOpen: boolean;
        title?: string;
        size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
        closeOnBackdrop?: boolean;
    }

    const props = withDefaults(defineProps<Props>(), {
        title: '',
        size: 'md',
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
        '2xl': 'max-w-2xl',
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
        <Transition name="modal">
            <div
                v-if="isOpen"
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
                <!-- Backdrop -->
                <div
                    class="fixed inset-0 bg-black/50 transition-opacity"
                    @click="handleBackdropClick"
                />

                <!-- Modal content -->
                <div
                    class="relative bg-white rounded-xl shadow-xl w-full max-h-[90vh] flex flex-col transition-all"
                    :class="sizeClasses[size]"
                >
                    <!-- Header -->
                    <div
                        v-if="title || $slots.header"
                        class="flex items-center justify-between px-8 py-5 border-b border-gray-200 flex-shrink-0"
                    >
                        <slot name="header">
                            <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
                        </slot>
                        <button
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
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
                    <div class="px-8 py-6 overflow-y-auto flex-grow">
                        <slot />
                    </div>

                    <!-- Footer -->
                    <div
                        v-if="$slots.footer"
                        class="flex items-center justify-end gap-3 px-8 py-5 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0"
                    >
                        <slot name="footer" />
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
    .modal-enter-active,
    .modal-leave-active {
        transition: opacity 0.2s ease;
    }

    .modal-enter-from,
    .modal-leave-to {
        opacity: 0;
    }

    .modal-enter-active > div:last-child,
    .modal-leave-active > div:last-child {
        transition: transform 0.2s ease;
    }

    .modal-enter-from > div:last-child,
    .modal-leave-to > div:last-child {
        transform: scale(0.95);
    }
</style>
