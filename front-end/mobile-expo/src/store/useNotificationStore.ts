import { create } from 'zustand';

interface NotificationState {
    hasNewNotification: boolean;
    setHasNewNotification: (hasNew: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    hasNewNotification: false,
    setHasNewNotification: (hasNew: boolean) => set({ hasNewNotification: hasNew }),
}));
