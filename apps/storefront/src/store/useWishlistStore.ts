import { create } from 'zustand';
import api from '@/utils/api';
import { useAuthStore } from './useAuthStore';

interface WishlistState {
    items: any[];
    loading: boolean;
    fetchWishlist: () => Promise<void>;
    toggleWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
    items: [],
    loading: false,
    fetchWishlist: async () => {
        if (!useAuthStore.getState().isAuthenticated) return;
        set({ loading: true });
        try {
            const res = await api.get('/wishlist');
            set({ items: res.data.wishlist || [] });
        } catch (error) {
            console.error('Failed to fetch wishlist');
        } finally {
            set({ loading: false });
        }
    },
    toggleWishlist: async (productId: string) => {
        if (!useAuthStore.getState().isAuthenticated) return;
        try {
            await api.post('/wishlist/toggle', { productId });
            await get().fetchWishlist();
        } catch (error) {
            console.error('Failed to toggle wishlist');
        }
    },
    isInWishlist: (productId: string) => {
        return get().items.some(item => (item._id || item) === productId);
    }
}));
