'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { CheckCircle, Package, ArrowRight, ShoppingBag } from 'lucide-react';

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('id');

    return (
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
            <div className="mb-8 flex justify-center">
                <div className="bg-green-50 p-6 rounded-full">
                    <CheckCircle className="w-20 h-20 text-green-500" />
                </div>
            </div>

            <h1 className="text-5xl font-black tracking-tight mb-4">ORDER PLACED!</h1>
            <p className="text-xl text-gray-500 mb-12">
                Thank you for your purchase. Your order has been received and is being processed.
            </p>

            <div className="bg-gray-50 rounded-3xl p-8 mb-12 text-left">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <Package className="w-6 h-6" />
                        <span className="font-bold text-lg">Order ID</span>
                    </div>
                    <span className="font-mono font-bold text-gray-600">{orderId}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                    A confirmation email has been sent to your registered email address. You can track your order status in your profile.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link href="/profile" className="btn-primary py-5 px-10 flex items-center justify-center space-x-3">
                    <Package className="w-6 h-6" />
                    <span>View My Orders</span>
                </Link>
                <Link href="/shop" className="btn-secondary py-5 px-10 flex items-center justify-center space-x-3">
                    <ShoppingBag className="w-6 h-6" />
                    <span>Continue Shopping</span>
                </Link>
            </div>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <>
            <Navbar />
            <Suspense fallback={<div className="p-24 text-center">Loading...</div>}>
                <OrderSuccessContent />
            </Suspense>
        </>
    );
}
