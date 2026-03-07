<script setup lang="ts">
    import { ref, computed } from 'vue';
    import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
    import { authService } from '@/api/services';
    import { useNotificationStore } from '@/stores';
    import { Spinner, Badge } from '@/components/common';
    import type { InviteResponse } from '@/types';

    const notifications = useNotificationStore();
    const queryClient = useQueryClient();

    // Invite email form
    const inviteeEmail = ref('');
    const showInviteForm = ref(false);

    // Fetch invites
    const {
        data: invites,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['invites'],
        queryFn: () => authService.listInvites(),
    });

    // Create invite mutation
    const createMutation = useMutation({
        mutationFn: (email: string) =>
            authService.createInvite({
                invitee_email: email,
                inviter_user_agent: navigator.userAgent,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invites'] });
            notifications.success('Invite sent successfully! An email has been sent to the invitee.');
            inviteeEmail.value = '';
            showInviteForm.value = false;
        },
        onError: (err: unknown) => {
            const error = err as { response?: { data?: { detail?: string } } };
            notifications.error(error.response?.data?.detail || 'Failed to send invite');
        },
    });

    const isValidEmail = computed(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(inviteeEmail.value);
    });

    // Helpers
    function formatDate(dateStr: string | null): string {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    function getInviteStatus(invite: InviteResponse): { label: string; variant: 'success' | 'warning' | 'error' | 'gray' } {
        if (invite.is_used) {
            return { label: 'Used', variant: 'gray' };
        }
        if (new Date(invite.expires_at) < new Date()) {
            return { label: 'Expired', variant: 'error' };
        }
        return { label: 'Pending', variant: 'warning' };
    }

    function isInviteActive(invite: InviteResponse): boolean {
        return !invite.is_used && new Date(invite.expires_at) > new Date();
    }

    function getInviteLink(code: string): string {
        return `${window.location.origin}/signup?invite=${code}`;
    }

    const copiedCode = ref<string | null>(null);

    async function copyInviteLink(code: string) {
        try {
            await navigator.clipboard.writeText(getInviteLink(code));
            copiedCode.value = code;
            notifications.success('Invite link copied to clipboard!');
            setTimeout(() => {
                copiedCode.value = null;
            }, 2000);
        } catch {
            notifications.error('Failed to copy link');
        }
    }

    function handleSendInvite() {
        if (!isValidEmail.value) return;
        createMutation.mutate(inviteeEmail.value);
    }
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Invite Users</h1>
                <p class="mt-1 text-sm text-gray-500">
                    Send invite emails to new users
                </p>
            </div>
            <button
                v-if="!showInviteForm"
                class="btn-primary flex items-center gap-2"
                @click="showInviteForm = true"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                    />
                </svg>
                Invite User
            </button>
        </div>

        <!-- Invite Form -->
        <div v-if="showInviteForm" class="card p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Send Invite</h3>
            <form @submit.prevent="handleSendInvite" class="space-y-4">
                <div>
                    <label for="invitee-email" class="block text-sm font-medium text-gray-700">
                        Email Address
                    </label>
                    <input
                        id="invitee-email"
                        v-model="inviteeEmail"
                        type="email"
                        required
                        class="input mt-1"
                        placeholder="newuser@example.com"
                    />
                    <p class="mt-1 text-sm text-gray-500">
                        An invitation email will be sent to this address with a signup link.
                    </p>
                </div>
                <div class="flex gap-3">
                    <button
                        type="submit"
                        :disabled="!isValidEmail || createMutation.isPending.value"
                        class="btn-primary flex items-center gap-2"
                    >
                        <Spinner v-if="createMutation.isPending.value" size="sm" />
                        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                        {{ createMutation.isPending.value ? 'Sending...' : 'Send Invite' }}
                    </button>
                    <button
                        type="button"
                        class="btn-secondary"
                        @click="showInviteForm = false; inviteeEmail = ''"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>

        <!-- Info Card -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <div class="text-sm text-blue-800">
                    <p class="font-medium">How invites work:</p>
                    <ul class="mt-1 list-disc list-inside space-y-1">
                        <li>Enter the email of the person you want to invite</li>
                        <li>They will receive an email with a signup link</li>
                        <li>Invite codes expire after 2 days</li>
                        <li>Each invite can only be used once</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center py-12">
            <Spinner size="lg" />
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="card p-6 text-center">
            <p class="text-red-600">Failed to load invites. Please try again.</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!invites || invites.length === 0" class="card p-12 text-center">
            <svg
                class="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900">No invites sent yet</h3>
            <p class="mt-2 text-sm text-gray-500">
                Invite new users by clicking the button above.
            </p>
        </div>

        <!-- Invites Table -->
        <div v-else class="card overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Sent Invites</h3>
            </div>
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Invitee Email
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sent
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Expires
                        </th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="invite in invites" :key="invite.id">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="text-sm text-gray-900">
                                {{ invite.invitee_email || '-' }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <Badge :variant="getInviteStatus(invite).variant">
                                {{ getInviteStatus(invite).label }}
                            </Badge>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {{ formatDate(invite.created_at) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {{ formatDate(invite.expires_at) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right">
                            <button
                                v-if="isInviteActive(invite)"
                                class="btn-secondary text-sm flex items-center gap-1 ml-auto"
                                @click="copyInviteLink(invite.code)"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        v-if="copiedCode === invite.code"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                    <path
                                        v-else
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                    />
                                </svg>
                                {{ copiedCode === invite.code ? 'Copied!' : 'Copy Link' }}
                            </button>
                            <span v-else class="text-sm text-gray-400">-</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>