<script setup lang="ts">
    import { ref, computed, watch } from 'vue';
    import { Modal, Spinner } from '@/components/common';
    import type { JobResponse, JobCreate, EmploymentType } from '@/types';

    interface Props {
        isOpen: boolean;
        job?: JobResponse | null;
    }

    const props = withDefaults(defineProps<Props>(), {
        job: null,
    });

    const emit = defineEmits<{
        close: [];
        save: [data: JobCreate, publish: boolean];
    }>();

    const isEditing = computed(() => !!props.job);
    const modalTitle = computed(() => (isEditing.value ? 'Edit Job Posting' : 'Create Job Posting'));

    const employmentTypes: { value: EmploymentType; label: string }[] = [
        { value: 'full-time', label: 'Full-time' },
        { value: 'part-time', label: 'Part-time' },
        { value: 'contract', label: 'Contract' },
        { value: 'internship', label: 'Internship' },
        { value: 'temporary', label: 'Temporary' },
    ];

    // Form state
    const form = ref<JobCreate>({
        title: '',
        summary: '',
        responsibilities: '',
        requirements: '',
        qualifications: '',
        benefits: '',
        notes: '',
        custom_instructions: '',
        location: '',
        department: '',
        employment_type: undefined,
        expires_at: '',
    });

    const saving = ref(false);
    const errors = ref<Record<string, string>>({});

    // Reset form when modal opens/closes or job changes
    watch(
        () => [props.isOpen, props.job],
        () => {
            if (props.isOpen) {
                if (props.job) {
                    // Editing - populate form
                    form.value = {
                        title: props.job.title,
                        summary: props.job.summary || '',
                        responsibilities: props.job.responsibilities || '',
                        requirements: props.job.requirements || '',
                        qualifications: props.job.qualifications || '',
                        benefits: props.job.benefits || '',
                        notes: props.job.notes || '',
                        custom_instructions: props.job.custom_instructions || '',
                        location: props.job.location || '',
                        department: props.job.department || '',
                        employment_type: (props.job.employment_type as EmploymentType) || undefined,
                        expires_at: props.job.expires_at ? props.job.expires_at.split('T')[0] : '',
                    };
                } else {
                    // Creating - reset form
                    form.value = {
                        title: '',
                        summary: '',
                        responsibilities: '',
                        requirements: '',
                        qualifications: '',
                        benefits: '',
                        notes: '',
                        custom_instructions: '',
                        location: '',
                        department: '',
                        employment_type: undefined,
                        expires_at: '',
                    };
                }
                errors.value = {};
            }
        },
        { immediate: true }
    );

    function validate(): boolean {
        errors.value = {};

        if (!form.value.title?.trim()) {
            errors.value.title = 'Title is required';
        } else if (form.value.title.length > 255) {
            errors.value.title = 'Title must be 255 characters or less';
        }

        return Object.keys(errors.value).length === 0;
    }

    function prepareData(): JobCreate {
        const data: JobCreate = {
            title: form.value.title!.trim(),
        };

        // Only include non-empty optional fields
        if (form.value.summary?.trim()) data.summary = form.value.summary.trim();
        if (form.value.responsibilities?.trim()) data.responsibilities = form.value.responsibilities.trim();
        if (form.value.requirements?.trim()) data.requirements = form.value.requirements.trim();
        if (form.value.qualifications?.trim()) data.qualifications = form.value.qualifications.trim();
        if (form.value.benefits?.trim()) data.benefits = form.value.benefits.trim();
        if (form.value.notes?.trim()) data.notes = form.value.notes.trim();
        if (form.value.custom_instructions?.trim()) data.custom_instructions = form.value.custom_instructions.trim();
        if (form.value.location?.trim()) data.location = form.value.location.trim();
        if (form.value.department?.trim()) data.department = form.value.department.trim();
        if (form.value.employment_type) data.employment_type = form.value.employment_type;
        if (form.value.expires_at) data.expires_at = new Date(form.value.expires_at).toISOString();

        return data;
    }

    function handleSave(publish: boolean) {
        if (!validate()) return;
        emit('save', prepareData(), publish);
    }

    function handleClose() {
        emit('close');
    }
</script>

<template>
    <Modal :is-open="isOpen" :title="modalTitle" size="xl" @close="handleClose">
        <form class="space-y-6" @submit.prevent="handleSave(false)">
            <!-- Title (Required) -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    Title <span class="text-red-500">*</span>
                </label>
                <input
                    v-model="form.title"
                    type="text"
                    class="input"
                    :class="{ 'border-red-500': errors.title }"
                    placeholder="e.g., Branch Manager, Loan Officer"
                />
                <p v-if="errors.title" class="mt-1 text-sm text-red-500">{{ errors.title }}</p>
            </div>

            <!-- Two columns for basic info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                        v-model="form.department"
                        type="text"
                        class="input"
                        placeholder="e.g., Collections, Finance"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                        v-model="form.location"
                        type="text"
                        class="input"
                        placeholder="e.g., Nairobi, Embu, Meru"
                    />
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                    <select v-model="form.employment_type" class="input">
                        <option :value="undefined">Select type...</option>
                        <option v-for="type in employmentTypes" :key="type.value" :value="type.value">
                            {{ type.label }}
                        </option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
                    <input v-model="form.expires_at" type="date" class="input" />
                </div>
            </div>

            <!-- Summary -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                <textarea
                    v-model="form.summary"
                    rows="3"
                    class="input"
                    placeholder="e.g., Manage loan disbursements and customer relationships..."
                />
            </div>

            <!-- Collapsible sections for detailed content -->
            <details class="border border-gray-200 rounded-lg">
                <summary class="px-4 py-3 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Job Details (Responsibilities, Requirements, etc.)
                </summary>
                <div class="px-4 pb-4 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Responsibilities</label>
                        <textarea
                            v-model="form.responsibilities"
                            rows="4"
                            class="input"
                            placeholder="- Process loan applications and assess creditworthiness\n- Manage customer accounts and follow up on repayments..."
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                        <textarea
                            v-model="form.requirements"
                            rows="4"
                            class="input"
                            placeholder="- 2+ years experience in microfinance or banking\n- Strong understanding of credit risk assessment..."
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
                        <textarea
                            v-model="form.qualifications"
                            rows="4"
                            class="input"
                            placeholder="- Diploma or degree in Finance, Business, or related field\n- CPA certification is an advantage..."
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
                        <textarea
                            v-model="form.benefits"
                            rows="4"
                            class="input"
                            placeholder="- Competitive salary and commissions\n- Medical insurance cover\n- Career growth opportunities..."
                        />
                    </div>
                </div>
            </details>

            <!-- AI & Internal Notes -->
            <details class="border border-gray-200 rounded-lg">
                <summary class="px-4 py-3 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50">
                    AI Instructions & Internal Notes
                </summary>
                <div class="px-4 pb-4 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Custom AI Instructions
                        </label>
                        <textarea
                            v-model="form.custom_instructions"
                            rows="3"
                            class="input"
                            placeholder="e.g., Prioritize candidates with microfinance experience"
                        />
                        <p class="mt-1 text-xs text-gray-500">
                            These instructions guide the AI when analyzing candidate CVs
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Internal Notes
                        </label>
                        <textarea
                            v-model="form.notes"
                            rows="3"
                            class="input"
                            placeholder="Notes for internal use only (not shown to applicants)"
                        />
                    </div>
                </div>
            </details>
        </form>

        <!-- Footer buttons -->
        <template #footer>
            <div class="flex justify-between w-full">
                <button type="button" class="btn-secondary" @click="handleClose">Cancel</button>
                <div class="flex gap-3">
                    <button
                        type="button"
                        class="btn-secondary"
                        :disabled="saving"
                        @click="handleSave(false)"
                    >
                        <Spinner v-if="saving" size="sm" class="mr-2" />
                        Save as Draft
                    </button>
                    <button
                        type="button"
                        class="btn-primary"
                        :disabled="saving"
                        @click="handleSave(true)"
                    >
                        <Spinner v-if="saving" size="sm" color="white" class="mr-2" />
                        {{ isEditing ? 'Save Changes' : 'Save & Publish' }}
                    </button>
                </div>
            </div>
        </template>
    </Modal>
</template>
