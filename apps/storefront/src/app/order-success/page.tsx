'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { CheckCircle, Package, ArrowRight, ShoppingBag, Gift, Heart, Star, Sparkles, ChevronRight } from 'lucide-react';
import Image from 'next/image';

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('id');

    return (
        <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex flex-col">
            <div className="container-main py-12 lg:py-24 flex-1 flex flex-col items-center">
                {/* Success Animation Container */}
                <div className="relative mb-10">
                    <div className="absolute inset-0 bg-amber-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                    <div className="relative bg-white p-6 rounded-full shadow-2xl shadow-amber-200/50">
                        <CheckCircle className="w-20 h-20 text-green-500 animate-bounce" />
                    </div>
                    {/* Decorative bits */}
                    <div className="absolute -top-4 -left-4 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center animate-bounce delay-100">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="absolute -bottom-2 -right-6 w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center animate-bounce delay-300">
                        <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                    </div>
                </div>

                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-4xl lg:text-5xl font-black text-gray-800 tracking-tight mb-4">
                        Order <span className="text-amber-600">Successfully</span> Placed!
                    </h1>
                    <p className="text-lg text-gray-500 leading-relaxed px-4">
                        Thank you for choosing Vagmi. Your order is being processed and will be delivered with a touch of tradition and love.
                    </p>
                </div>

                {/* Info Card */}
                <div className="w-full max-w-xl bg-white rounded-[40px] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden mb-12">
                    <div className="p-8 lg:p-10">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
                                    <Package className="w-6 h-6 text-amber-600" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Order Identifier</p>
                                    <p className="font-mono text-xl font-black text-gray-800">#{orderId?.slice(-8).toUpperCase()}</p>
                                </div>
                            </div>
                            <div className="text-center sm:text-right">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Status</p>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100">
                                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                                    Processing
                                </span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                    <Gift className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm mb-1">Order Confirmation</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        We've sent a detailed summary and receipt to your registered email address.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                                    <Star className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm mb-1">Track Delivery</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        You can monitor your shipment progress in real-time from your account dashboard.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
                        <Link
                            href="/profile"
                            className="text-amber-600 font-bold text-sm hover:underline flex items-center justify-center gap-2"
                        >
                            Visit My Account Dashboard <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl">
                    <Link
                        href="/profile"
                        className="flex-1 bg-gray-900 text-white py-5 px-8 rounded-full font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg shadow-gray-200"
                    >
                        <Package className="w-5 h-5" />
                        Manage Order
                    </Link>
                    <Link
                        href="/shop"
                        className="flex-1 bg-white text-amber-600 border-2 border-amber-100 py-5 px-8 rounded-full font-bold flex items-center justify-center gap-3 hover:bg-amber-50 transition-all shadow-sm"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        Continue Shopping
                    </Link>
                </div>

                {/* Support Link */}
                <p className="mt-12 text-sm text-gray-400 font-medium">
                    Need help? <Link href="/contact" className="text-gray-600 underline">Contact Support</Link>
                </p>
            </div>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <>
            <Navbar />
            <Suspense fallback={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin"></div>
                </div>
            }>
                <OrderSuccessContent />
            </Suspense>
        </>
    );
}
