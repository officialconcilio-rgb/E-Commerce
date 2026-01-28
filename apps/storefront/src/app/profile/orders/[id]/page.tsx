'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, CreditCard, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function OrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/orders/${id}`);
                setOrder(res.data.order);
            } catch (error) {
                console.error('Failed to fetch order details');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
        </div>
    );

    if (!order) return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container-main py-24 text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h1>
                <p className="text-gray-500 mb-8">The order you're looking for doesn't exist or you don't have access to it.</p>
                <Link href="/profile" className="btn-primary py-3 px-8">Back to Profile</Link>
            </div>
        </div>
    );

    const steps = [
        { name: 'Ordered', icon: Clock, status: 'completed' },
        { name: 'Confirmed', icon: CheckCircle, status: order.status !== 'Pending' ? 'completed' : 'pending' },
        { name: 'Shipped', icon: Truck, status: ['Shipped', 'Delivered'].includes(order.status) ? 'completed' : 'pending' },
        { name: 'Delivered', icon: Package, status: order.status === 'Delivered' ? 'completed' : 'pending' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="container-main py-3">
                    <nav className="text-sm text-gray-500 flex items-center">
                        <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <Link href="/profile" className="hover:text-amber-600 transition-colors">My Account</Link>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <span className="text-gray-800">Order #{order.orderNumber}</span>
                    </nav>
                </div>
            </div>

            <div className="container-main py-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-amber-600 transition-colors mb-8 font-semibold"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Orders
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Order Status Header */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800 mb-1">Order #{order.orderNumber}</h1>
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                    </p>
                                </div>
                                <div className={`px-4 py-2 rounded-full text-xs font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                    }`}>
                                    {order.status.toUpperCase()}
                                </div>
                            </div>

                            {/* Tracker */}
                            <div className="relative">
                                <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100"></div>
                                <div className="relative flex justify-between">
                                    {steps.map((step, i) => (
                                        <div key={i} className="flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 shadow-sm transition-all duration-500 ${step.status === 'completed' ? 'bg-amber-600 text-white' : 'bg-white border-2 border-gray-100 text-gray-300'
                                                }`}>
                                                <step.icon className="w-5 h-5" />
                                            </div>
                                            <span className={`mt-3 text-xs font-bold transition-colors duration-500 ${step.status === 'completed' ? 'text-gray-800' : 'text-gray-400'
                                                }`}>
                                                {step.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-amber-600" />
                                    Order Items
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {order.items.map((item: any, i: number) => (
                                    <div key={i} className="p-6 flex gap-6 hover:bg-gray-50 transition-colors group">
                                        <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-amber-600/20">
                                                    <Package className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-800 group-hover:text-amber-600 transition-colors line-clamp-1">{item.name}</h4>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Qty: {item.quantity}
                                                {item.variant && ` • Size: ${item.variant.size || 'N/A'}`}
                                            </p>
                                            <p className="font-bold text-gray-800 mt-3 text-lg">₹{item.price * item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Order Summary */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-6">Price Details</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-gray-800">₹{order.totalAmount}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Shipping Fee</span>
                                    <span className="font-semibold text-green-600 font-bold uppercase text-[10px] tracking-wider">
                                        {order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}
                                    </span>
                                </div>
                                {order.discountAmount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Discount Apply</span>
                                        <span className="font-semibold">-₹{order.discountAmount}</span>
                                    </div>
                                )}
                                <div className="pt-4 border-t border-gray-100 flex justify-between">
                                    <span className="font-bold text-gray-800">Final Amount</span>
                                    <span className="font-bold text-gray-800 text-xl">₹{order.finalAmount}</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                    <CreditCard className="w-4 h-4 text-amber-600" />
                                    Payment Method
                                </div>
                                <span className="text-xs font-bold text-gray-800">{order.paymentMethod.toUpperCase()}</span>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-amber-600" />
                                Shipping To
                            </h3>
                            <div className="text-sm text-gray-600 space-y-2">
                                <p className="font-bold text-gray-800 leading-relaxed uppercase text-[11px] tracking-widest text-gray-400">Delivery Address</p>
                                <div className="bg-gray-50 p-4 rounded-xl text-gray-800 font-medium">
                                    <p>{order.shippingAddress.street}</p>
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
                                    <p className="text-gray-500 mt-2 text-xs">{order.shippingAddress.country}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
