import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/utils/api';
import { useAuthStore } from './useAuthStore';

interface CartItem {
    productId: any;
    variantId: any;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    totalItems: number;
    totalAmount: number;
    addItem: (item: CartItem) => Promise<void>;
    removeItem: (variantId: string) => Promise<void>;
    updateQuantity: (variantId: string, quantity: number) => Promise<void>;
    clearCart: () => void;
    fetchCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            totalItems: 0,
            totalAmount: 0,
            fetchCart: async () => {
                try {
                    const res = await api.get('/cart');
                    const items = res.data.cart.items;
                    set({
                        items,
                        totalItems: items.reduce((acc: number, item: any) => acc + item.quantity, 0)
                    });
                } catch (error: any) {
                    if (error.response?.status === 401) {
                        useAuthStore.getState().logout();
                    }
                    console.error('Failed to fetch cart');
                }
            },
            addItem: async (item) => {
                try {
                    await api.post('/cart/add', item);
                    get().fetchCart();
                } catch (error: any) {
                    if (error.response?.status === 401) {
                        useAuthStore.getState().logout();
                    }
                    console.error('Failed to add item');
                }
            },
            removeItem: async (variantId) => {
                try {
                    await api.delete(`/cart/remove/${variantId}`);
                    get().fetchCart();
                } catch (error: any) {
                    if (error.response?.status === 401) {
                        useAuthStore.getState().logout();
                    }
                    console.error('Failed to remove item');
                }
            },
            updateQuantity: async (variantId, quantity) => {
                try {
                    await api.patch('/cart/update', { variantId, quantity });
                    get().fetchCart();
                } catch (error: any) {
                    if (error.response?.status === 401) {
                        useAuthStore.getState().logout();
                    }
                    console.error('Failed to update quantity');
                }
            },
            clearCart: () => set({ items: [], totalItems: 0, totalAmount: 0 }),
        }),
        {
            name: 'cart-storage',
        }
    )
);
