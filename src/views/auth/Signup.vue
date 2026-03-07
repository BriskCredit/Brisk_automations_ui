<script setup lang="ts">
    import { ref, computed, onMounted } from 'vue';
    import { useRouter, useRoute } from 'vue-router';
    import { useAuthStore, useNotificationStore } from '@/stores';
    import { authService } from '@/api/services';
    import { Spinner } from '@/components/common';

    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();
    const notifications = useNotificationStore();

    // Invite code validation
    const inviteCode = ref('');
    const isValidatingInvite = ref(false);
    const isInviteValid = ref(false);
    const inviteMessage = ref('');

    // Form fields
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const name = ref('');
    const showPassword = ref(false);
    const isSubmitting = ref(false);
    const errorMessage = ref('');

    const isFormValid = computed(() => {
        return (
            name.value.trim() !== '' &&
            email.value.trim() !== '' &&
            password.value.length >= 8 &&
            password.value === confirmPassword.value &&
            isInviteValid.value
        );
    });

    const passwordsMatch = computed(() => {
        return confirmPassword.value === '' || password.value === confirmPassword.value;
    });

    onMounted(async () => {
        // Extract invite code from URL
        const code = route.query.invite as string;
        if (!code) {
            inviteMessage.value = 'No invite code provided. You need an invitation to sign up.';
            return;
        }

        inviteCode.value = code;
        await validateInviteCode(code);
    });

    async function validateInviteCode(code: string) {
        isValidatingInvite.value = true;
        try {
            const response = await authService.validateInvite(code);
            isInviteValid.value = response.valid;
            inviteMessage.value = response.message;
        } catch {
            isInviteValid.value = false;
            inviteMessage.value = 'Error validating invite code. Please try again.';
        } finally {
            isValidatingInvite.value = false;
        }
    }

    async function handleSubmit() {
        if (!isFormValid.value || isSubmitting.value) return;

        errorMessage.value = '';
        isSubmitting.value = true;

        try {
            await authStore.register({
                email: email.value,
                password: password.value,
                name: name.value,
                invite_code: inviteCode.value,
            });

            notifications.success('Registration successful! Please sign in.');
            router.push('/login');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } };
            errorMessage.value = err.response?.data?.detail || 'Registration failed. Please try again.';
        } finally {
            isSubmitting.value = false;
        }
    }
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <!-- Header -->
            <div class="text-center">
                <h1 class="text-3xl font-bold text-gray-900">Brisk Automations</h1>
                <h2 class="mt-4 text-xl font-semibold text-gray-700">Create your account</h2>
            </div>

            <!-- Loading State -->
            <div v-if="isValidatingInvite" class="text-center py-8">
                <Spinner size="lg" />
                <p class="mt-4 text-gray-600">Validating invite code...</p>
            </div>

            <!-- Invalid Invite -->
            <div
                v-else-if="!isInviteValid"
                class="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
            >
                <svg
                    class="mx-auto h-12 w-12 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
                <h3 class="mt-4 text-lg font-medium text-red-800">Invalid Invite</h3>
                <p class="mt-2 text-sm text-red-600">{{ inviteMessage }}</p>
                <RouterLink
                    to="/login"
                    class="mt-4 inline-block text-sm text-blue-600 hover:text-blue-500"
                >
                    Already have an account? Sign in
                </RouterLink>
            </div>

            <!-- Registration Form -->
            <form v-else class="mt-8 space-y-6" @submit.prevent="handleSubmit">
                <!-- Success Message -->
                <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {{ inviteMessage }}
                </div>

                <!-- Error Message -->
                <div
                    v-if="errorMessage"
                    class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
                >
                    {{ errorMessage }}
                </div>

                <div class="space-y-4">
                    <!-- Name Field -->
                    <div>
                        <label for="name" class="block text-sm font-medium text-gray-700">
                            Name
                        </label>
                        <input
                            id="name"
                            v-model="name"
                            type="text"
                            autocomplete="name"
                            required
                            class="input mt-1"
                            placeholder="John Doe"
                        />
                    </div>

                    <!-- Email Field -->
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <input
                            id="email"
                            v-model="email"
                            type="email"
                            autocomplete="email"
                            required
                            class="input mt-1"
                            placeholder="you@example.com"
                        />
                    </div>

                    <!-- Password Field -->
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div class="relative mt-1">
                            <input
                                id="password"
                                v-model="password"
                                :type="showPassword ? 'text' : 'password'"
                                autocomplete="new-password"
                                required
                                minlength="8"
                                class="input pr-10"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                @click="showPassword = !showPassword"
                            >
                                <svg
                                    v-if="!showPassword"
                                    class="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                                <svg
                                    v-else
                                    class="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                    />
                                </svg>
                            </button>
                        </div>
                        <p
                            v-if="password && password.length < 8"
                            class="mt-1 text-sm text-red-600"
                        >
                            Password must be at least 8 characters
                        </p>
                    </div>

                    <!-- Confirm Password Field -->
                    <div>
                        <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            v-model="confirmPassword"
                            :type="showPassword ? 'text' : 'password'"
                            autocomplete="new-password"
                            required
                            class="input mt-1"
                            placeholder="••••••••"
                        />
                        <p v-if="!passwordsMatch" class="mt-1 text-sm text-red-600">
                            Passwords do not match
                        </p>
                    </div>
                </div>

                <!-- Submit Button -->
                <div>
                    <button
                        type="submit"
                        :disabled="!isFormValid || isSubmitting"
                        class="btn-primary w-full flex justify-center items-center"
                    >
                        <Spinner v-if="isSubmitting" size="sm" class="mr-2" />
                        {{ isSubmitting ? 'Creating account...' : 'Create account' }}
                    </button>
                </div>

                <!-- Login Link -->
                <div class="text-center">
                    <RouterLink to="/login" class="text-sm text-blue-600 hover:text-blue-500">
                        Already have an account? Sign in
                    </RouterLink>
                </div>
            </form>
        </div>
    </div>
</template>
