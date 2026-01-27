'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Truck, ShieldCheck, Gift, ChevronRight } from 'lucide-react';

export default function CartPage() {
    const { items, fetchCart, updateQuantity, removeItem } = useCartStore();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        }
    }, [isAuthenticated, fetchCart]);

    const subtotal = items.reduce((acc, item: any) => {
        const price = item.variantId?.priceOverride || item.productId?.price || 0;
        return acc + (price * item.quantity);
    }, 0);

    const originalTotal = items.reduce((acc, item: any) => {
        return acc + ((item.productId?.price || 0) * item.quantity);
    }, 0);

    const discount = originalTotal - subtotal;
    const freeShippingThreshold = 999;
    const shipping = subtotal > freeShippingThreshold ? 0 : 99;
    const total = subtotal + shipping;

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container-main py-12 lg:py-16">
                    <div className="max-w-md mx-auto text-center bg-white rounded-2xl p-8 lg:p-12 shadow-sm">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-amber-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-3">Please login to view your bag</h1>
                        <p className="text-gray-500 mb-6">Sign in to access your shopping bag and saved items</p>
                        <Link href="/login" className="btn-primary">
                            Login Now
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="container-main py-3">
                    <nav className="flex items-center text-sm text-gray-500">
                        <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <span className="text-gray-800">Shopping Bag</span>
                    </nav>
                </div>
            </div>

            <div className="container-main py-6 lg:py-8">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-800 mb-6">
                    My Bag <span className="text-gray-400 font-normal">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                </h1>

                {items.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-8 lg:p-12 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Gift className="w-12 h-12 text-amber-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Your bag is empty</h2>
                        <p className="text-gray-500 mb-6">Looks like you haven't added any gifts yet</p>
                        <Link href="/shop" className="btn-primary">
                            Explore Gifts
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Free Shipping Banner */}
                            {subtotal < freeShippingThreshold && (
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4 flex items-center gap-3">
                                    <Truck className="w-5 h-5 text-amber-600" />
                                    <p className="text-sm text-gray-700">
                                        Add <span className="font-semibold text-amber-700">₹{freeShippingThreshold - subtotal}</span> more to get
                                        <span className="font-semibold text-amber-700"> FREE Shipping</span>
                                    </p>
                                </div>
                            )}

                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                {items.map((item: any, index: number) => (
                                    <div key={item.variantId?._id || index} className={`p-4 lg:p-6 ${index !== items.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                        <div className="flex gap-4">
                                            <Link href={`/product/${item.productId?.slug}`} className="shrink-0">
                                                <div className="relative w-20 h-24 sm:w-24 sm:h-32 rounded-xl overflow-hidden bg-gray-100">
                                                    <Image
                                                        src={item.productId?.images?.[0] || 'https://via.placeholder.com/200'}
                                                        alt={item.productId?.name || 'Product'}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            </Link>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold text-amber-600 uppercase mb-1">
                                                            {item.productId?.brand || 'VAGMI'}
                                                        </p>
                                                        <Link href={`/product/${item.productId?.slug}`}>
                                                            <h3 className="font-medium text-gray-800 hover:text-amber-600 transition-colors line-clamp-2 text-sm sm:text-base">
                                                                {item.productId?.name}
                                                            </h3>
                                                        </Link>
                                                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                                            {item.variantId?.size && `Size: ${item.variantId.size}`}
                                                            {item.variantId?.color && ` • Color: ${item.variantId.color}`}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.variantId?._id)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-1 h-fit"
                                                        title="Remove item"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                <div className="flex flex-wrap items-end justify-between gap-3 mt-4">
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                                        <button
                                                            onClick={() => updateQuantity(item.variantId?._id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                            className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="w-10 text-center font-medium text-sm">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.variantId?._id, item.quantity + 1)}
                                                            className="p-2 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="text-right">
                                                        <p className="font-bold text-gray-800">
                                                            ₹{(item.variantId?.priceOverride || item.productId?.price || 0) * item.quantity}
                                                        </p>
                                                        {item.variantId?.priceOverride && item.variantId.priceOverride < item.productId?.price && (
                                                            <p className="text-xs sm:text-sm">
                                                                <span className="text-gray-400 line-through">₹{item.productId.price * item.quantity}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-28">
                                {/* Coupon */}
                                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                                    <Tag className="w-5 h-5 text-amber-600" />
                                    <input
                                        type="text"
                                        placeholder="Apply Coupon Code"
                                        className="flex-1 text-sm outline-none placeholder:text-gray-400"
                                    />
                                    <button className="text-amber-600 font-semibold text-sm hover:underline">
                                        Apply
                                    </button>
                                </div>

                                <h3 className="font-semibold text-gray-800 mt-4 mb-4 text-sm uppercase tracking-wide">
                                    Price Details ({items.length} {items.length === 1 ? 'Item' : 'Items'})
                                </h3>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Total MRP</span>
                                        <span>₹{originalTotal}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount on MRP</span>
                                            <span>-₹{discount}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping Fee</span>
                                        <span className={shipping === 0 ? 'text-green-600' : ''}>
                                            {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3 mt-3">
                                        <div className="flex justify-between font-bold text-base text-gray-800">
                                            <span>Total Amount</span>
                                            <span>₹{total}</span>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href="/checkout"
                                    className="btn-primary w-full mt-6 py-4 text-base flex items-center justify-center gap-2"
                                >
                                    Place Order
                                    <ArrowRight className="w-5 h-5" />
                                </Link>

                                {/* Trust Badges */}
                                <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <ShieldCheck className="w-5 h-5 text-green-600" />
                                        <span>100% Secure Payments</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Truck className="w-5 h-5 text-green-600" />
                                        <span>Free shipping on orders above ₹{freeShippingThreshold}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Gift className="w-5 h-5 text-green-600" />
                                        <span>Premium packaging for all gifts</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
