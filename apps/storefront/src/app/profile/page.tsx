'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/utils/api';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { Package, MapPin, User as UserIcon, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, checkAuth } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const res = await api.get('/orders');
                setOrders(res.data.orders);
            } catch (error) {
                console.error('Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isAuthenticated, router]);

    if (!user) return null;

    return (
        <>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 text-center">
                            <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-4">
                                {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
                            <p className="text-gray-500 text-sm">{user.email}</p>
                        </div>

                        <nav className="space-y-2">
                            <Link href="/profile" className="w-full flex items-center justify-between p-4 bg-black text-white rounded-2xl font-bold">
                                <div className="flex items-center space-x-3">
                                    <Package className="w-5 h-5" />
                                    <span>My Orders</span>
                                </div>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                            <Link href="/profile/addresses" className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                                <div className="flex items-center space-x-3">
                                    <MapPin className="w-5 h-5" />
                                    <span>Addresses</span>
                                </div>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                            <Link href="/profile/settings" className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                                <div className="flex items-center space-x-3">
                                    <UserIcon className="w-5 h-5" />
                                    <span>Account Settings</span>
                                </div>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <h1 className="text-3xl font-black mb-8">MY ORDERS.</h1>

                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-32 bg-gray-100 rounded-3xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-24 bg-gray-50 rounded-3xl">
                                <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                                <Link href="/shop" className="btn-primary inline-block">Start Shopping</Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {orders.map((order: any) => (
                                    <div key={order._id} className="bg-white border-2 border-gray-100 rounded-3xl p-8 hover:border-black transition-all">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Order Number</p>
                                                <p className="font-black text-lg">{order.orderNumber}</p>
                                            </div>
                                            <div className="flex space-x-8">
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Date</p>
                                                    <p className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Total</p>
                                                    <p className="font-bold">₹{order.finalAmount}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Status</p>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                                        }`}>
                                                        {order.status.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                            <div className="flex -space-x-4">
                                                {order.items.slice(0, 3).map((item: any, i: number) => (
                                                    <div key={i} className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-100 relative">
                                                        {/* In a real app, we'd fetch product images here */}
                                                        <div className="w-full h-full bg-gray-200"></div>
                                                    </div>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold">
                                                        +{order.items.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <Link href={`/profile/orders/${order._id}`} className="text-sm font-bold hover:underline">
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
