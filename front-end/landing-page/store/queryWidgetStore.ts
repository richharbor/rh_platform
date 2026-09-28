import { create } from 'zustand';

interface QueryWidgetState {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
}

export const useQueryWidgetStore = create<QueryWidgetState>((set) => ({
    isOpen: false,
    open: () => {
        // const whatsappUrl = `https://wa.me/919211265558?text=Hello!%20I%20have%20a%20query.`;
        // window.open(whatsappUrl, "_blank");
        set({ isOpen: true });
    },
    close: () => set({ isOpen: false }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
