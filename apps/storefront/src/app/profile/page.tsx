'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/utils/api';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { Package, MapPin, ChevronRight, Heart, Settings, LogOut, CreditCard, ShoppingBag, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();
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
                setOrders(res.data.orders || []);
            } catch (error) {
                console.error('Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isAuthenticated, router]);

    if (!user) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
    );

    const menuItems = [
        { icon: <Package className="w-5 h-5" />, label: 'My Orders', href: '/profile', active: true, count: orders.length },
        { icon: <Heart className="w-5 h-5" />, label: 'Wishlist', href: '/wishlist' },
        { icon: <MapPin className="w-5 h-5" />, label: 'Addresses', href: '/profile/addresses' },
        { icon: <CreditCard className="w-5 h-5" />, label: 'Saved Cards', href: '/profile/cards' },
        { icon: <Settings className="w-5 h-5" />, label: 'Account Settings', href: '/profile/settings' },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="container-main py-3">
                    <nav className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center">
                        <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
                        <ChevronRight className="w-3.5 h-3.5 mx-2" />
                        <span className="text-gray-900">My Account</span>
                    </nav>
                </div>
            </div>

            <div className="container-main py-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 xl:gap-12">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden sticky top-28">
                            {/* User Info */}
                            <div className="p-8 bg-gradient-to-br from-amber-500 to-orange-600">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-3xl font-black text-white border-4 border-white/30 mb-4 shadow-xl">
                                        {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                                    </div>
                                    <h2 className="text-xl font-black text-white px-2 break-all uppercase tracking-tight">
                                        {user.firstName} {user.lastName}
                                    </h2>
                                    <p className="text-amber-100 text-xs font-semibold mt-1 opacity-80">{user.email}</p>
                                </div>
                            </div>

                            {/* Menu */}
                            <nav className="p-4 space-y-1">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${item.active
                                            ? 'bg-amber-600 text-white shadow-lg shadow-amber-200 translate-x-1'
                                            : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`${item.active ? 'text-white' : 'text-amber-600'}`}>
                                                {item.icon}
                                            </div>
                                            <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {item.count !== undefined && (
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${item.active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {item.count}
                                                </span>
                                            )}
                                            <ChevronRight className={`w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity ${item.active ? 'text-white' : ''}`} />
                                        </div>
                                    </Link>
                                ))}

                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all duration-300 mt-4 group"
                                >
                                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                    <span className="font-bold text-sm tracking-tight">Logout</span>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 lg:p-10 min-h-[600px]">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">My Orders</h1>
                                    <p className="text-gray-400 text-sm font-medium">Manage and track your recent orders</p>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 p-1.5 bg-gray-50 rounded-xl">
                                    <button className="px-4 py-2 bg-white rounded-lg shadow-sm text-xs font-bold text-amber-600">All</button>
                                    <button className="px-4 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">Pending</button>
                                    <button className="px-4 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">Delivered</button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="space-y-6">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="animate-pulse bg-gray-50 rounded-3xl p-6 border border-gray-100">
                                            <div className="flex gap-6">
                                                <div className="w-20 h-24 bg-gray-200 rounded-2xl"></div>
                                                <div className="flex-1 space-y-3 py-2">
                                                    <div className="h-4 bg-gray-200 rounded-full w-40"></div>
                                                    <div className="h-4 bg-gray-200 rounded-full w-60"></div>
                                                    <div className="h-4 bg-gray-200 rounded-full w-24"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-24 h-24 bg-amber-50 rounded-[40px] flex items-center justify-center mb-6">
                                        <ShoppingBag className="w-10 h-10 text-amber-300" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No orders placed yet</h3>
                                    <p className="text-gray-400 mb-10 max-w-xs mx-auto">Discover our collection and make your first purchase to see it here.</p>
                                    <Link href="/shop" className="btn-primary py-4 px-10 rounded-full shadow-lg shadow-amber-200">
                                        Browse Products
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {orders.map((order: any) => (
                                        <Link
                                            key={order._id}
                                            href={`/profile/orders/${order._id}`}
                                            className="group block bg-gray-50/50 hover:bg-white border border-gray-100 hover:border-amber-300 rounded-[32px] p-6 lg:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-amber-100 hover:-translate-y-1"
                                        >
                                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                                {/* Left: Images */}
                                                <div className="flex -space-x-4 shrink-0">
                                                    {order.items.slice(0, 3).map((item: any, idx: number) => (
                                                        <div
                                                            key={idx}
                                                            className="relative w-20 h-28 bg-white rounded-2xl overflow-hidden border-2 border-white shadow-lg z-10 hover:z-20 transition-all hover:scale-105"
                                                            style={{ zIndex: 3 - idx }}
                                                        >
                                                            <Image
                                                                src={item.productId?.images?.[0] || 'https://via.placeholder.com/200'}
                                                                alt=""
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                                    {order.items.length > 3 && (
                                                        <div className="w-20 h-28 bg-amber-100 border-2 border-white rounded-2xl flex items-center justify-center text-sm font-black text-amber-700 shadow-lg relative z-0">
                                                            +{order.items.length - 3}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Middle: Info */}
                                                <div className="flex-1 text-center md:text-left">
                                                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 py-1 px-3 bg-amber-50 rounded-full w-fit mx-auto md:mx-0">
                                                            ORDER #{order._id.slice(-8).toUpperCase()}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 justify-center md:justify-start">
                                                            <Clock className="w-3.5 h-3.5 text-gray-300" />
                                                            <p className="text-xs text-gray-400 font-bold">
                                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric'
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                                                        {order.items.length} Product{order.items.length > 1 ? 's' : ''} Purchased
                                                    </h3>
                                                    <p className="text-2xl font-black text-gray-900 tracking-tight">₹{order.totalAmount}</p>
                                                </div>

                                                {/* Right: Status */}
                                                <div className="shrink-0 flex flex-col items-center md:items-end gap-4">
                                                    <div className={`
                                                        flex items-center gap-2 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider border-2
                                                        ${order.status === 'delivered'
                                                            ? 'bg-green-50 text-green-700 border-green-100'
                                                            : order.status === 'cancelled'
                                                                ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                                : 'bg-amber-50 text-amber-600 border-amber-100'
                                                        }
                                                    `}>
                                                        <span className={`w-2 h-2 rounded-full ${order.status === 'delivered' ? 'bg-green-500' :
                                                                order.status === 'cancelled' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'
                                                            }`}></span>
                                                        {order.status}
                                                    </div>
                                                    <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
                                                        <ChevronRight className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
