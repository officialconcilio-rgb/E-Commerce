import { create } from 'zustand';
import api from '@/utils/api';

interface StoreSettings {
    freeShippingThreshold: number;
    shippingCost: number;
    returnPeriodDays: number;
}

interface SettingsStore {
    settings: StoreSettings;
    loading: boolean;
    fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
    settings: {
        freeShippingThreshold: 5000,
        shippingCost: 150,
        returnPeriodDays: 30 // Default fallback
    },
    loading: false,
    fetchSettings: async () => {
        set({ loading: true });
        try {
            const res = await api.get('/settings');
            if (res.data.success) {
                set({ settings: res.data.data });
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            set({ loading: false });
        }
    }
}));
