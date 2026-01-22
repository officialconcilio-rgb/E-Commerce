import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/utils/api';

interface AdminState {
    admin: any | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, admin: any) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAdminStore = create<AdminState>()(
    persist(
        (set) => ({
            admin: null,
            token: null,
            isAuthenticated: false,
            login: (token, admin) => {
                sessionStorage.setItem('admin_token', token);
                set({ token, admin, isAuthenticated: true });
            },
            logout: () => {
                sessionStorage.removeItem('admin_token');
                set({ token: null, admin: null, isAuthenticated: false });
            },
            checkAuth: async () => {
                try {
                    const res = await api.get('/auth/me');
                    if (res.data.user.role === 'User') throw new Error('Not an admin');
                    set({ admin: res.data.user, isAuthenticated: true });
                } catch (error) {
                    sessionStorage.removeItem('admin_token');
                    set({ admin: null, token: null, isAuthenticated: false });
                }
            },
        }),
        {
            name: 'admin-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
