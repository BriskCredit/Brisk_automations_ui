<script setup lang="ts">
    import { ref, computed, watch } from 'vue';
    import { useMutation, useQueryClient } from '@tanstack/vue-query';
    import { applicationsService } from '@/api/services';
    import { useNotificationStore } from '@/stores';
    import { Modal, Badge, Spinner } from '@/components/common';
    import type { ApplicationResponse, ApplicationStatus } from '@/types';

    interface Props {
        isOpen: boolean;
        application: ApplicationResponse | null;
    }

    const props = defineProps<Props>();

    const emit = defineEmits<{
        close: [];
        updated: [];
    }>();

    const queryClient = useQueryClient();
    const notifications = useNotificationStore();

    const activeTab = ref<'info' | 'ai' | 'resume'>('info');
    const currentStatus = ref<ApplicationStatus>('submitted');

    const statusOptions: { value: ApplicationStatus; label: string }[] = [
        { value: 'submitted', label: 'Submitted' },
        { value: 'reviewed', label: 'Reviewed' },
        { value: 'shortlisted', label: 'Shortlisted' },
        { value: 'contacted', label: 'Contacted' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'hired', label: 'Hired' },
    ];

    // Sync status when application changes
    watch(
        () => props.application,
        (app) => {
            if (app) {
                currentStatus.value = app.status;
                activeTab.value = 'info';
            }
        },
        { immediate: true }
    );

    const updateStatusMutation = useMutation({
        mutationFn: (status: ApplicationStatus) =>
            applicationsService.updateStatus(props.application!.id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['applicationStats'] });
            notifications.success('Status updated successfully');
            emit('updated');
        },
        onError: () => {
            notifications.error('Failed to update status');
            // Revert to original status
            if (props.application) {
                currentStatus.value = props.application.status;
            }
        },
    });

    function handleStatusChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        const newStatus = target.value as ApplicationStatus;
        if (newStatus !== props.application?.status) {
            currentStatus.value = newStatus;
            updateStatusMutation.mutate(newStatus);
        }
    }

    function getStatusVariant(status: ApplicationStatus): 'success' | 'warning' | 'error' | 'gray' | 'info' {
        switch (status) {
            case 'submitted':
                return 'gray';
            case 'reviewed':
                return 'info';
            case 'shortlisted':
                return 'success';
            case 'contacted':
                return 'info';
            case 'rejected':
                return 'error';
            case 'hired':
                return 'success';
            default:
                return 'gray';
        }
    }

    function getScoreClass(score: number | null): string {
        if (score === null) return 'text-gray-400 bg-gray-100';
        if (score >= 7) return 'text-green-600 bg-green-100';
        if (score >= 4) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    }

    function formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    function formatMarkdown(text: string): string {
        // Escape HTML first to prevent XSS
        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // Convert markdown headers to HTML
        html = html
            .replace(/^#### (.+)$/gm, '<h6 class="text-sm font-semibold text-gray-800 mt-4 mb-1">$1</h6>')
            .replace(/^### (.+)$/gm, '<h5 class="text-sm font-semibold text-gray-800 mt-4 mb-1">$1</h5>')
            .replace(/^## (.+)$/gm, '<h4 class="text-base font-semibold text-gray-900 mt-4 mb-2">$1</h4>')
            .replace(/^# (.+)$/gm, '<h3 class="text-lg font-bold text-gray-900 mt-4 mb-2">$1</h3>');
        
        // Convert **bold** to <strong>
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        
        // Convert *italic* to <em>
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        
        // Convert bullet points
        html = html.replace(/^[\-\*] (.+)$/gm, '<li class="ml-4">$1</li>');
        
        // Convert newlines to <br> for remaining text
        html = html.replace(/\n/g, '<br>');
        
        return html;
    }

    const resumeEmbedUrl = computed(() => {
        if (!props.application?.resume_url) return null;
        // For PDF files, we can embed directly or use Google Docs viewer
        const url = props.application.resume_url;
        // If it's a direct PDF link, add parameters to hide sidebar and fit to width
        if (url.toLowerCase().endsWith('.pdf')) {
            // Parameters: navpanes=0 hides sidebar, view=FitH fits width, toolbar=0 hides toolbar
            return `${url}#navpanes=0&view=FitH`;
        }
        // For other formats, use Google Docs Viewer
        return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    });
</script>

<template>
    <Modal :is-open="isOpen" title="" size="2xl" @close="emit('close')">
        <div v-if="application" class="min-h-[500px] flex flex-col">
            <!-- Header with Status -->
            <div class="pb-4 border-b border-gray-200 mb-4">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <h2 class="text-xl font-semibold text-gray-900">{{ application.applicant_name }}</h2>
                        <div class="mt-1 flex items-center gap-3 text-sm text-gray-600">
                            <a :href="`mailto:${application.applicant_email}`" class="text-primary-600 hover:text-primary-800">
                                {{ application.applicant_email }}
                            </a>
                            <span v-if="application.applicant_phone">{{ application.applicant_phone }}</span>
                        </div>
                        <p class="mt-1 text-xs text-gray-500">Applied {{ formatDate(application.created_at) }}</p>
                    </div>
                    
                    <div class="flex items-center gap-2">
                        <label class="text-sm text-gray-600">Status:</label>
                        <select
                            :value="currentStatus"
                            :disabled="updateStatusMutation.isPending.value"
                            class="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-primary-500 focus:border-primary-500"
                            @change="handleStatusChange"
                        >
                            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                                {{ opt.label }}
                            </option>
                        </select>
                        <Spinner v-if="updateStatusMutation.isPending.value" size="sm" />
                    </div>
                </div>
            </div>

            <!-- Tabs -->
            <div class="border-b border-gray-200 mb-4">
                <nav class="-mb-px flex space-x-6">
                    <button
                        class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
                        :class="
                            activeTab === 'info'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        "
                        @click="activeTab = 'info'"
                    >
                        Applicant Info
                    </button>
                    <button
                        class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
                        :class="
                            activeTab === 'ai'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        "
                        @click="activeTab = 'ai'"
                    >
                        AI Analysis
                    </button>
                    <button
                        class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
                        :class="
                            activeTab === 'resume'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        "
                        @click="activeTab = 'resume'"
                    >
                        Resume
                    </button>
                </nav>
            </div>

            <!-- Tab Content -->
            <div class="flex-grow overflow-auto">
                <!-- Applicant Info Tab -->
                <div v-if="activeTab === 'info'" class="space-y-6">
                    <!-- Cover Letter -->
                    <div v-if="application.cover_letter">
                        <h3 class="text-sm font-medium text-gray-700 mb-2">Cover Letter</h3>
                        <div class="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                            {{ application.cover_letter }}
                        </div>
                    </div>
                    <div v-else class="text-sm text-gray-500 italic">No cover letter provided.</div>

                    <!-- Admin Notes -->
                    <div v-if="application.admin_notes">
                        <h3 class="text-sm font-medium text-gray-700 mb-2">Admin Notes</h3>
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                            {{ application.admin_notes }}
                        </div>
                    </div>

                    <!-- Application Details -->
                    <div>
                        <h3 class="text-sm font-medium text-gray-700 mb-2">Application Details</h3>
                        <dl class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <dt class="text-gray-500">Status</dt>
                                <dd class="mt-1">
                                    <Badge :variant="getStatusVariant(application.status)">
                                        {{ application.status.charAt(0).toUpperCase() + application.status.slice(1) }}
                                    </Badge>
                                </dd>
                            </div>
                            <div>
                                <dt class="text-gray-500">Applied On</dt>
                                <dd class="mt-1 text-gray-900">{{ formatDate(application.created_at) }}</dd>
                            </div>
                            <div v-if="application.reviewed_at">
                                <dt class="text-gray-500">Reviewed On</dt>
                                <dd class="mt-1 text-gray-900">{{ formatDate(application.reviewed_at) }}</dd>
                            </div>
                            <div v-if="application.resume_filename">
                                <dt class="text-gray-500">Resume File</dt>
                                <dd class="mt-1 text-gray-900">{{ application.resume_filename }}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <!-- AI Analysis Tab -->
                <div v-if="activeTab === 'ai'" class="space-y-6">
                    <!-- AI Score -->
                    <div class="flex items-center gap-4">
                        <div>
                            <h3 class="text-sm font-medium text-gray-700 mb-2">AI Score</h3>
                            <span
                                class="inline-flex items-center px-4 py-2 rounded-lg text-2xl font-bold"
                                :class="getScoreClass(application.ai_score)"
                            >
                                {{ application.ai_score !== null ? `${application.ai_score.toFixed(1)}/10` : 'N/A' }}
                            </span>
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-gray-700 mb-2">Analysis Status</h3>
                            <Badge
                                :variant="
                                    application.ai_analysis_status === 'completed'
                                        ? 'success'
                                        : application.ai_analysis_status === 'failed'
                                          ? 'error'
                                          : application.ai_analysis_status === 'processing'
                                            ? 'info'
                                            : 'gray'
                                "
                            >
                                {{ application.ai_analysis_status.charAt(0).toUpperCase() + application.ai_analysis_status.slice(1) }}
                            </Badge>
                        </div>
                    </div>

                    <!-- AI Comments -->
                    <div v-if="application.ai_comments">
                        <h3 class="text-sm font-medium text-gray-700 mb-2">AI Assessment</h3>
                        <div 
                            class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700 prose prose-sm max-w-none"
                            v-html="formatMarkdown(application.ai_comments)"
                        />
                    </div>

                    <!-- AI Error -->
                    <div v-if="application.ai_analysis_error">
                        <h3 class="text-sm font-medium text-red-700 mb-2">Analysis Error</h3>
                        <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                            {{ application.ai_analysis_error }}
                        </div>
                    </div>

                    <!-- No AI Analysis -->
                    <div
                        v-if="!application.ai_comments && !application.ai_analysis_error && application.ai_analysis_status === 'pending'"
                        class="text-center py-8 text-gray-500"
                    >
                        <svg class="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <p class="text-sm">AI analysis is pending...</p>
                    </div>
                </div>

                <!-- Resume Tab -->
                <div v-if="activeTab === 'resume'" class="h-[400px]">
                    <template v-if="resumeEmbedUrl">
                        <iframe
                            :src="resumeEmbedUrl"
                            class="w-full h-full border border-gray-200 rounded-lg"
                            title="Resume"
                        />
                    </template>
                    <div v-else class="flex flex-col items-center justify-center h-full text-gray-500">
                        <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p class="text-sm">No resume uploaded</p>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <button class="btn-secondary" @click="emit('close')">
                Close
            </button>
        </template>
    </Modal>
</template>
