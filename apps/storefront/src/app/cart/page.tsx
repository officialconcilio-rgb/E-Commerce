'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

export default function CartPage() {
    const { items, fetchCart, updateQuantity, removeItem } = useCartStore();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        }
    }, [isAuthenticated, fetchCart]);

    const subtotal = items.reduce((acc, item: any) => {
        const price = item.variantId.priceOverride || item.productId.basePrice;
        return acc + (price * item.quantity);
    }, 0);

    const shipping = subtotal > 5000 ? 0 : 150;
    const total = subtotal + shipping;

    if (!isAuthenticated) {
        return (
            <>
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-24 text-center">
                    <h1 className="text-3xl font-black mb-4">Please login to view your cart</h1>
                    <Link href="/login" className="btn-primary inline-block">Login Now</Link>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-black tracking-tight mb-12">YOUR BAG.</h1>

                {items.length === 0 ? (
                    <div className="text-center py-24 bg-gray-50 rounded-3xl">
                        <h2 className="text-2xl font-bold mb-4">Your bag is empty</h2>
                        <Link href="/shop" className="btn-primary inline-block">Start Shopping</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Items List */}
                        <div className="lg:col-span-2 space-y-8">
                            {items.map((item: any) => (
                                <div key={item.variantId._id} className="flex space-x-6 pb-8 border-b border-gray-100">
                                    <div className="relative w-32 h-40 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                                        <Image
                                            src={item.productId.images[0]}
                                            alt={item.productId.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold">{item.productId.name}</h3>
                                                <p className="text-gray-500 text-sm mt-1">
                                                    Size: {item.variantId.size} | Color: {item.variantId.color}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.variantId._id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center border-2 border-gray-100 rounded-xl px-2 py-1">
                                                <button
                                                    onClick={() => updateQuantity(item.variantId._id, item.quantity - 1)}
                                                    className="p-2 hover:bg-gray-50 rounded-lg"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-10 text-center font-bold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.variantId._id, item.quantity + 1)}
                                                    className="p-2 hover:bg-gray-50 rounded-lg"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <span className="text-xl font-black">
                                                ₹{(item.variantId.priceOverride || item.productId.basePrice) * item.quantity}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-50 rounded-3xl p-8 sticky top-32">
                                <h2 className="text-2xl font-bold mb-8">Order Summary</h2>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax (GST 12%)</span>
                                        <span>Included</span>
                                    </div>
                                    <hr className="border-gray-200" />
                                    <div className="flex justify-between text-xl font-black">
                                        <span>Total</span>
                                        <span>₹{total}</span>
                                    </div>
                                </div>

                                <Link
                                    href="/checkout"
                                    className="w-full btn-primary py-5 flex items-center justify-center space-x-3"
                                >
                                    <span className="text-lg font-bold">Checkout Now</span>
                                    <ArrowRight className="w-6 h-6" />
                                </Link>

                                <p className="text-xs text-gray-400 text-center mt-6">
                                    Free shipping on orders above ₹5,000
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
