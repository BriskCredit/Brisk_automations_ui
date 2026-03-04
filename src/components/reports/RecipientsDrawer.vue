<script setup lang="ts">
    import { ref, computed } from 'vue';
    import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
    import { recipientsService } from '@/api/services';
    import { useNotificationStore } from '@/stores';
    import { Drawer, Badge, Spinner, Modal, ConfirmDialog } from '@/components/common';
    import type { RecipientResponse, RecipientCreate, RecipientUpdate } from '@/types';

    interface Props {
        isOpen: boolean;
        reportTypeCode: string;
        reportTypeName: string;
    }

    const props = defineProps<Props>();

    const emit = defineEmits<{
        close: [];
    }>();

    const queryClient = useQueryClient();
    const notifications = useNotificationStore();

    // State for modals
    const showAddModal = ref(false);
    const showEditModal = ref(false);
    const showDeleteConfirm = ref(false);
    const selectedRecipient = ref<RecipientResponse | null>(null);

    // Form state
    const formData = ref({
        email: '',
        name: '',
        is_cc: false,
        is_bcc: false,
    });

    // Fetch recipients for this report type
    const {
        data: recipientsResponse,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['recipients', props.reportTypeCode],
        queryFn: () => recipientsService.getAll({ report_type_code: props.reportTypeCode, page_size: 5 }),
        enabled: computed(() => props.isOpen),
    });

    // Extract items from paginated response
    const recipients = computed(() => recipientsResponse.value?.items ?? []);

    // Create recipient mutation
    const createMutation = useMutation({
        mutationFn: (data: RecipientCreate) => recipientsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recipients', props.reportTypeCode] });
            queryClient.invalidateQueries({ queryKey: ['recipients'] });
            notifications.success('Recipient added successfully');
            closeAddModal();
        },
        onError: () => {
            notifications.error('Failed to add recipient');
        },
    });

    // Update recipient mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: RecipientUpdate }) =>
            recipientsService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recipients', props.reportTypeCode] });
            queryClient.invalidateQueries({ queryKey: ['recipients'] });
            notifications.success('Recipient updated successfully');
            closeEditModal();
        },
        onError: () => {
            notifications.error('Failed to update recipient');
        },
    });

    // Delete recipient mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => recipientsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recipients', props.reportTypeCode] });
            queryClient.invalidateQueries({ queryKey: ['recipients'] });
            notifications.success('Recipient deleted successfully');
            closeDeleteConfirm();
        },
        onError: () => {
            notifications.error('Failed to delete recipient');
        },
    });

    // Computed lists
    const toRecipients = computed(() =>
        recipients.value.filter((r) => !r.is_cc && !r.is_bcc && r.is_active)
    );
    const ccRecipients = computed(() =>
        recipients.value.filter((r) => r.is_cc && !r.is_bcc && r.is_active)
    );
    const bccRecipients = computed(() =>
        recipients.value.filter((r) => r.is_bcc && r.is_active)
    );
    const inactiveRecipients = computed(() =>
        (recipients.value ?? []).filter((r) => !r.is_active)
    );

    // Methods
    function openAddModal() {
        formData.value = { email: '', name: '', is_cc: false, is_bcc: false };
        showAddModal.value = true;
    }

    function closeAddModal() {
        showAddModal.value = false;
        formData.value = { email: '', name: '', is_cc: false, is_bcc: false };
    }

    function openEditModal(recipient: RecipientResponse) {
        selectedRecipient.value = recipient;
        formData.value = {
            email: recipient.email,
            name: recipient.name ?? '',
            is_cc: recipient.is_cc,
            is_bcc: recipient.is_bcc,
        };
        showEditModal.value = true;
    }

    function closeEditModal() {
        showEditModal.value = false;
        selectedRecipient.value = null;
        formData.value = { email: '', name: '', is_cc: false, is_bcc: false };
    }

    function openDeleteConfirm(recipient: RecipientResponse) {
        selectedRecipient.value = recipient;
        showDeleteConfirm.value = true;
    }

    function closeDeleteConfirm() {
        showDeleteConfirm.value = false;
        selectedRecipient.value = null;
    }

    function handleCreate() {
        createMutation.mutate({
            email: formData.value.email,
            name: formData.value.name || undefined,
            report_type_code: props.reportTypeCode,
            is_cc: formData.value.is_cc,
            is_bcc: formData.value.is_bcc,
        });
    }

    function handleUpdate() {
        if (!selectedRecipient.value) return;
        updateMutation.mutate({
            id: selectedRecipient.value.id,
            data: {
                email: formData.value.email,
                name: formData.value.name || undefined,
                is_cc: formData.value.is_cc,
                is_bcc: formData.value.is_bcc,
            },
        });
    }

    function handleDelete() {
        if (!selectedRecipient.value) return;
        deleteMutation.mutate(selectedRecipient.value.id);
    }

    function toggleActive(recipient: RecipientResponse) {
        updateMutation.mutate({
            id: recipient.id,
            data: { is_active: !recipient.is_active },
        });
    }

    function getRecipientType(recipient: RecipientResponse): string {
        if (recipient.is_bcc) return 'BCC';
        if (recipient.is_cc) return 'CC';
        return 'TO';
    }
</script>

<template>
    <Drawer :is-open="isOpen" :title="`${reportTypeName} Recipients`" size="lg" @close="emit('close')">
        <!-- Loading -->
        <div v-if="isLoading" class="flex items-center justify-center py-12">
            <Spinner size="lg" />
        </div>

        <!-- Error -->
        <div v-else-if="error" class="text-center py-12">
            <p class="text-red-600">Failed to load recipients</p>
        </div>

        <!-- Content -->
        <div v-else class="space-y-6">
            <!-- Add Button -->
            <div class="flex justify-end">
                <button class="btn-primary" @click="openAddModal">
                    <svg
                        class="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    Add Recipient
                </button>
            </div>

            <!-- TO Recipients -->
            <div v-if="toRecipients.length > 0">
                <h3 class="text-sm font-medium text-gray-700 mb-2">TO Recipients</h3>
                <div class="space-y-2">
                    <div
                        v-for="recipient in toRecipients"
                        :key="recipient.id"
                        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                        <div>
                            <p class="text-sm font-medium text-gray-900">{{ recipient.email }}</p>
                            <p v-if="recipient.name" class="text-xs text-gray-500">
                                {{ recipient.name }}
                            </p>
                        </div>
                        <div class="flex items-center gap-2">
                            <button
                                class="p-1 text-gray-400 hover:text-gray-600"
                                @click="openEditModal(recipient)"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                            <button
                                class="p-1 text-gray-400 hover:text-red-600"
                                @click="openDeleteConfirm(recipient)"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CC Recipients -->
            <div v-if="ccRecipients.length > 0">
                <h3 class="text-sm font-medium text-gray-700 mb-2">CC Recipients</h3>
                <div class="space-y-2">
                    <div
                        v-for="recipient in ccRecipients"
                        :key="recipient.id"
                        class="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                    >
                        <div>
                            <p class="text-sm font-medium text-gray-900">{{ recipient.email }}</p>
                            <p v-if="recipient.name" class="text-xs text-gray-500">
                                {{ recipient.name }}
                            </p>
                        </div>
                        <div class="flex items-center gap-2">
                            <Badge variant="info" size="sm">CC</Badge>
                            <button
                                class="p-1 text-gray-400 hover:text-gray-600"
                                @click="openEditModal(recipient)"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                            <button
                                class="p-1 text-gray-400 hover:text-red-600"
                                @click="openDeleteConfirm(recipient)"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- BCC Recipients -->
            <div v-if="bccRecipients.length > 0">
                <h3 class="text-sm font-medium text-gray-700 mb-2">BCC Recipients</h3>
                <div class="space-y-2">
                    <div
                        v-for="recipient in bccRecipients"
                        :key="recipient.id"
                        class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
                    >
                        <div>
                            <p class="text-sm font-medium text-gray-900">{{ recipient.email }}</p>
                            <p v-if="recipient.name" class="text-xs text-gray-500">
                                {{ recipient.name }}
                            </p>
                        </div>
                        <div class="flex items-center gap-2">
                            <Badge variant="warning" size="sm">BCC</Badge>
                            <button
                                class="p-1 text-gray-400 hover:text-gray-600"
                                @click="openEditModal(recipient)"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                            <button
                                class="p-1 text-gray-400 hover:text-red-600"
                                @click="openDeleteConfirm(recipient)"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Inactive Recipients -->
            <div v-if="inactiveRecipients.length > 0">
                <h3 class="text-sm font-medium text-gray-500 mb-2">Inactive Recipients</h3>
                <div class="space-y-2">
                    <div
                        v-for="recipient in inactiveRecipients"
                        :key="recipient.id"
                        class="flex items-center justify-between p-3 bg-gray-100 rounded-lg opacity-60"
                    >
                        <div>
                            <p class="text-sm font-medium text-gray-600">{{ recipient.email }}</p>
                            <p v-if="recipient.name" class="text-xs text-gray-400">
                                {{ recipient.name }}
                            </p>
                        </div>
                        <div class="flex items-center gap-2">
                            <Badge variant="gray" size="sm">{{ getRecipientType(recipient) }}</Badge>
                            <button
                                class="text-xs text-primary-600 hover:text-primary-800"
                                @click="toggleActive(recipient)"
                            >
                                Activate
                            </button>
                            <button
                                class="p-1 text-gray-400 hover:text-red-600"
                                @click="openDeleteConfirm(recipient)"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div
                v-if="!toRecipients.length && !ccRecipients.length && !bccRecipients.length && !inactiveRecipients.length"
                class="text-center py-12"
            >
                <p class="text-gray-500">No recipients configured for this report.</p>
                <button class="btn-primary mt-4" @click="openAddModal">Add First Recipient</button>
            </div>
        </div>

        <!-- Add Recipient Modal -->
        <Modal :is-open="showAddModal" title="Add Recipient" @close="closeAddModal">
            <form @submit.prevent="handleCreate" class="space-y-4">
                <div>
                    <label class="label">Email *</label>
                    <input
                        v-model="formData.email"
                        type="email"
                        class="input"
                        placeholder="email@example.com"
                        required
                    />
                </div>
                <div>
                    <label class="label">Name</label>
                    <input
                        v-model="formData.name"
                        type="text"
                        class="input"
                        placeholder="Recipient name (optional)"
                    />
                </div>
                <div class="flex items-center gap-6">
                    <label class="flex items-center gap-2">
                        <input
                            v-model="formData.is_cc"
                            type="checkbox"
                            class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            @change="formData.is_bcc = false"
                        />
                        <span class="text-sm text-gray-700">CC</span>
                    </label>
                    <label class="flex items-center gap-2">
                        <input
                            v-model="formData.is_bcc"
                            type="checkbox"
                            class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            @change="formData.is_cc = false"
                        />
                        <span class="text-sm text-gray-700">BCC</span>
                    </label>
                </div>
            </form>
            <template #footer>
                <button class="btn-secondary" @click="closeAddModal">Cancel</button>
                <button
                    class="btn-primary"
                    :disabled="createMutation.isPending.value || !formData.email"
                    @click="handleCreate"
                >
                    <Spinner v-if="createMutation.isPending.value" size="sm" color="white" class="mr-2" />
                    Add Recipient
                </button>
            </template>
        </Modal>

        <!-- Edit Recipient Modal -->
        <Modal :is-open="showEditModal" title="Edit Recipient" @close="closeEditModal">
            <form @submit.prevent="handleUpdate" class="space-y-4">
                <div>
                    <label class="label">Email *</label>
                    <input
                        v-model="formData.email"
                        type="email"
                        class="input"
                        placeholder="email@example.com"
                        required
                    />
                </div>
                <div>
                    <label class="label">Name</label>
                    <input
                        v-model="formData.name"
                        type="text"
                        class="input"
                        placeholder="Recipient name (optional)"
                    />
                </div>
                <div class="flex items-center gap-6">
                    <label class="flex items-center gap-2">
                        <input
                            v-model="formData.is_cc"
                            type="checkbox"
                            class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            @change="formData.is_bcc = false"
                        />
                        <span class="text-sm text-gray-700">CC</span>
                    </label>
                    <label class="flex items-center gap-2">
                        <input
                            v-model="formData.is_bcc"
                            type="checkbox"
                            class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            @change="formData.is_cc = false"
                        />
                        <span class="text-sm text-gray-700">BCC</span>
                    </label>
                </div>
            </form>
            <template #footer>
                <button class="btn-secondary" @click="closeEditModal">Cancel</button>
                <button
                    class="btn-primary"
                    :disabled="updateMutation.isPending.value || !formData.email"
                    @click="handleUpdate"
                >
                    <Spinner v-if="updateMutation.isPending.value" size="sm" color="white" class="mr-2" />
                    Save Changes
                </button>
            </template>
        </Modal>

        <!-- Delete Confirmation -->
        <ConfirmDialog
            :is-open="showDeleteConfirm"
            title="Delete Recipient"
            :message="`Are you sure you want to delete ${selectedRecipient?.email}? This action cannot be undone.`"
            confirm-text="Delete"
            variant="danger"
            :loading="deleteMutation.isPending.value"
            @confirm="handleDelete"
            @cancel="closeDeleteConfirm"
        />
    </Drawer>
</template>
