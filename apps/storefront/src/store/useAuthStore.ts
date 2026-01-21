import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/utils/api';

interface AuthState {
    user: any | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, user: any) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: (token, user) => {
                localStorage.setItem('token', token);
                set({ token, user, isAuthenticated: true });
            },
            logout: () => {
                localStorage.removeItem('token');
                set({ token: null, user: null, isAuthenticated: false });
            },
            checkAuth: async () => {
                try {
                    const res = await api.get('/auth/me');
                    set({ user: res.data.user, isAuthenticated: true });
                } catch (error) {
                    localStorage.removeItem('token');
                    set({ user: null, token: null, isAuthenticated: false });
                }
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
