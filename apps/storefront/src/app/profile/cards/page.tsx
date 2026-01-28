'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Package, MapPin, User as UserIcon, ChevronRight, CreditCard, Lock, Plus } from 'lucide-react';

export default function SavedCardsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="container-main py-3">
                    <nav className="text-sm text-gray-500">
                        <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/profile" className="hover:text-amber-600 transition-colors">My Account</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-800">Saved Cards</span>
                    </nav>
                </div>
            </div>

            <div className="container-main py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-24">
                            {/* User Info */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xl font-bold">
                                        {user.firstName[0]}{user.lastName[0]}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{user.firstName} {user.lastName}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Menu */}
                            <nav className="p-2">
                                <Link
                                    href="/profile"
                                    className="flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Package className="w-5 h-5" />
                                        <span className="font-medium">My Orders</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </Link>
                                <Link
                                    href="/profile/addresses"
                                    className="flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-5 h-5" />
                                        <span className="font-medium">Addresses</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </Link>
                                <Link
                                    href="/profile/settings"
                                    className="flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <UserIcon className="w-5 h-5" />
                                        <span className="font-medium">Account Settings</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </Link>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h1 className="text-xl font-bold text-gray-800">Saved Cards</h1>
                                <button
                                    disabled
                                    className="btn-primary py-2 px-6 flex items-center gap-2 text-sm opacity-50 cursor-not-allowed"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Card
                                </button>
                            </div>

                            {/* Empty State / Coming Soon */}
                            <div className="text-center py-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CreditCard className="w-10 h-10" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 mb-3">No Saved Cards</h2>
                                <p className="text-gray-500 max-w-sm mx-auto mb-8">
                                    Saved cards feature is being optimized for enhanced security. You can still pay securely via UPI, Cards, and Wallets at checkout.
                                </p>
                                <div className="flex items-center justify-center gap-2 text-amber-600 font-bold text-sm bg-amber-50 py-2 px-4 rounded-full w-fit mx-auto border border-amber-100">
                                    <Lock className="w-4 h-4" />
                                    <span>Encrypted & Secure</span>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                    <ChevronRight className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-blue-800 mb-1">Why save cards?</h3>
                                    <p className="text-sm text-blue-700 leading-relaxed">
                                        Saving your cards helps in 1-click checkouts and faster refunds. We use bank-grade encryption to keep your data safe.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
