import { defineStore } from 'pinia';
import { ref } from 'vue';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    duration?: number;
}

export const useNotificationStore = defineStore('notifications', () => {
    const notifications = ref<Notification[]>([]);

    function generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }

    function addNotification(type: NotificationType, message: string, duration = 5000) {
        const id = generateId();
        const notification: Notification = { id, type, message, duration };
        notifications.value.push(notification);

        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }

        return id;
    }

    function removeNotification(id: string) {
        const index = notifications.value.findIndex((n) => n.id === id);
        if (index > -1) {
            notifications.value.splice(index, 1);
        }
    }

    function success(message: string, duration?: number) {
        return addNotification('success', message, duration);
    }

    function error(message: string, duration?: number) {
        return addNotification('error', message, duration);
    }

    function warning(message: string, duration?: number) {
        return addNotification('warning', message, duration);
    }

    function info(message: string, duration?: number) {
        return addNotification('info', message, duration);
    }

    function clearAll() {
        notifications.value = [];
    }

    return {
        notifications,
        addNotification,
        removeNotification,
        success,
        error,
        warning,
        info,
        clearAll,
    };
});
