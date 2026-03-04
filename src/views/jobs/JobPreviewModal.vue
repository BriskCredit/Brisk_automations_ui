<script setup lang="ts">
    import { computed } from 'vue';
    import { Modal, Badge } from '@/components/common';
    import type { JobResponse } from '@/types';

    interface Props {
        isOpen: boolean;
        job: JobResponse | null;
    }

    const props = defineProps<Props>();

    const emit = defineEmits<{
        close: [];
    }>();

    const employmentTypeLabel = computed(() => {
        if (!props.job?.employment_type) return null;
        const labels: Record<string, string> = {
            'full-time': 'Full-time',
            'part-time': 'Part-time',
            'contract': 'Contract',
            'internship': 'Internship',
            'temporary': 'Temporary',
        };
        return labels[props.job.employment_type] || props.job.employment_type;
    });

    const formattedDate = computed(() => {
        if (!props.job?.published_at) return null;
        return new Date(props.job.published_at).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    });

    const formattedDeadline = computed(() => {
        if (!props.job?.expires_at) return null;
        return new Date(props.job.expires_at).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    });

    function formatMultiline(text: string | null): string[] {
        if (!text) return [];
        return text.split('\n').filter(line => line.trim());
    }
</script>

<template>
    <Modal :is-open="isOpen" title="Job Preview" size="xl" @close="emit('close')">
        <div v-if="job" class="space-y-6">
            <!-- Header -->
            <div class="border-b border-gray-200 pb-6">
                <h2 class="text-2xl font-bold text-gray-900">{{ job.title }}</h2>
                
                <div class="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <span v-if="job.department" class="flex items-center gap-1.5">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {{ job.department }}
                    </span>
                    
                    <span v-if="job.location" class="flex items-center gap-1.5">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {{ job.location }}
                    </span>
                    
                    <Badge v-if="employmentTypeLabel" variant="info">
                        {{ employmentTypeLabel }}
                    </Badge>
                </div>

                <p v-if="formattedDate" class="mt-2 text-xs text-gray-500">
                    Posted {{ formattedDate }}
                    <span v-if="formattedDeadline"> · Apply by {{ formattedDeadline }}</span>
                </p>
            </div>

            <!-- Summary -->
            <div v-if="job.summary" class="prose prose-sm max-w-none">
                <p class="text-gray-700 leading-relaxed">{{ job.summary }}</p>
            </div>

            <!-- Responsibilities -->
            <div v-if="job.responsibilities">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Responsibilities</h3>
                <ul class="space-y-2">
                    <li 
                        v-for="(item, index) in formatMultiline(job.responsibilities)" 
                        :key="index"
                        class="flex items-start gap-2 text-sm text-gray-700"
                    >
                        <svg class="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{{ item.replace(/^[-•]\s*/, '') }}</span>
                    </li>
                </ul>
            </div>

            <!-- Requirements -->
            <div v-if="job.requirements">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                <ul class="space-y-2">
                    <li 
                        v-for="(item, index) in formatMultiline(job.requirements)" 
                        :key="index"
                        class="flex items-start gap-2 text-sm text-gray-700"
                    >
                        <svg class="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{{ item.replace(/^[-•]\s*/, '') }}</span>
                    </li>
                </ul>
            </div>

            <!-- Qualifications -->
            <div v-if="job.qualifications">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Qualifications</h3>
                <ul class="space-y-2">
                    <li 
                        v-for="(item, index) in formatMultiline(job.qualifications)" 
                        :key="index"
                        class="flex items-start gap-2 text-sm text-gray-700"
                    >
                        <svg class="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{{ item.replace(/^[-•]\s*/, '') }}</span>
                    </li>
                </ul>
            </div>

            <!-- Benefits -->
            <div v-if="job.benefits">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">What We Offer</h3>
                <ul class="space-y-2">
                    <li 
                        v-for="(item, index) in formatMultiline(job.benefits)" 
                        :key="index"
                        class="flex items-start gap-2 text-sm text-gray-700"
                    >
                        <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{{ item.replace(/^[-•]\s*/, '') }}</span>
                    </li>
                </ul>
            </div>

            <!-- Apply CTA (visual only) -->
            <div class="pt-6 border-t border-gray-200">
                <button 
                    class="w-full btn-primary py-3 text-center cursor-default opacity-75"
                    disabled
                >
                    Apply for this Position
                </button>
                <p class="mt-2 text-xs text-gray-500 text-center">
                    This is a preview. The apply button is disabled.
                </p>
            </div>
        </div>

        <template #footer>
            <button class="btn-secondary" @click="emit('close')">
                Close Preview
            </button>
        </template>
    </Modal>
</template>
