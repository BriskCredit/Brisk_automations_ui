import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import router from './router';
import App from './App.vue';
import './styles/index.css';

// Create Vue Query client with defaults
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60, // 1 minute
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

const app = createApp(App);

// Plugins
app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin, { queryClient });

app.mount('#app');
