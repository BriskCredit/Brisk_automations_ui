<script setup lang="ts">
    import { ref, computed } from 'vue';
    import { useRouter, useRoute } from 'vue-router';
    import { useAuthStore, useNotificationStore } from '@/stores';
    import { Spinner } from '@/components/common';

    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();
    const notifications = useNotificationStore();

    const email = ref('');
    const password = ref('');
    const showPassword = ref(false);
    const isSubmitting = ref(false);
    const errorMessage = ref('');

    const isFormValid = computed(() => {
        return email.value.trim() !== '' && password.value.trim() !== '';
    });

    async function handleSubmit() {
        if (!isFormValid.value || isSubmitting.value) return;

        errorMessage.value = '';
        isSubmitting.value = true;

        try {
            await authStore.login({
                email: email.value,
                password: password.value,
            });

            notifications.success('Login successful!');

            // Redirect to intended page or dashboard
            const redirectTo = (route.query.redirect as string) || '/';
            router.push(redirectTo);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } };
            errorMessage.value = err.response?.data?.detail || 'Invalid email or password';
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
                <h2 class="mt-4 text-xl font-semibold text-gray-700">Sign in to your account</h2>
            </div>

            <!-- Login Form -->
            <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
                <!-- Error Message -->
                <div
                    v-if="errorMessage"
                    class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
                >
                    {{ errorMessage }}
                </div>

                <div class="space-y-4">
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
                                autocomplete="current-password"
                                required
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
                        {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
