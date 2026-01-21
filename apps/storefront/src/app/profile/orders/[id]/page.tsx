'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { ArrowLeft, Package, Truck, CheckCircle, Clock } from 'lucide-react';
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

    if (loading) return <div className="p-24 text-center">Loading...</div>;
    if (!order) return <div className="p-24 text-center">Order not found</div>;

    const steps = [
        { name: 'Pending', icon: Clock, status: 'completed' },
        { name: 'Confirmed', icon: CheckCircle, status: order.status !== 'Pending' ? 'completed' : 'pending' },
        { name: 'Shipped', icon: Truck, status: ['Shipped', 'Delivered'].includes(order.status) ? 'completed' : 'pending' },
        { name: 'Delivered', icon: Package, status: order.status === 'Delivered' ? 'completed' : 'pending' },
    ];

    return (
        <>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <button
                    onClick={() => router.back()}
                    className="flex items-center space-x-2 text-gray-500 hover:text-black transition-colors mb-8 font-bold"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Orders</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight mb-2">ORDER #{order.orderNumber}</h1>
                                <p className="text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="bg-black text-white px-6 py-3 rounded-2xl font-bold">
                                {order.status.toUpperCase()}
                            </div>
                        </div>

                        {/* Tracking */}
                        <div className="bg-gray-50 rounded-[40px] p-10">
                            <h2 className="text-xl font-bold mb-10">Track Order</h2>
                            <div className="relative flex justify-between">
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
                                {steps.map((step, i) => (
                                    <div key={i} className="relative z-10 flex flex-col items-center">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step.status === 'completed' ? 'bg-black text-white' : 'bg-white border-4 border-gray-200 text-gray-300'
                                            }`}>
                                            <step.icon className="w-6 h-6" />
                                        </div>
                                        <p className={`mt-4 text-sm font-bold ${step.status === 'completed' ? 'text-black' : 'text-gray-400'
                                            }`}>
                                            {step.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Order Items</h2>
                            {order.items.map((item: any, i: number) => (
                                <div key={i} className="flex space-x-6 p-6 border-2 border-gray-100 rounded-3xl">
                                    <div className="relative w-24 h-32 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                                        {/* In a real app we'd have the image here */}
                                        <div className="w-full h-full bg-gray-200"></div>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h3 className="text-lg font-bold">{item.name}</h3>
                                        <p className="text-gray-500 text-sm">SKU: {item.sku} | Qty: {item.quantity}</p>
                                        <p className="text-xl font-black mt-2">₹{item.price * item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Summary */}
                        <div className="bg-white border-2 border-gray-100 rounded-[40px] p-10">
                            <h2 className="text-xl font-bold mb-8">Summary</h2>
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-gray-500">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-black">₹{order.totalAmount}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Shipping</span>
                                    <span className="font-bold text-black">₹{order.shippingFee}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Discount</span>
                                    <span className="font-bold text-green-600">-₹{order.discountAmount}</span>
                                </div>
                                <hr className="border-gray-100" />
                                <div className="flex justify-between text-2xl font-black">
                                    <span>Total</span>
                                    <span>₹{order.finalAmount}</span>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl text-center">
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Payment Status</p>
                                <p className="font-bold text-green-600">{order.paymentStatus.toUpperCase()}</p>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white border-2 border-gray-100 rounded-[40px] p-10">
                            <h2 className="text-xl font-bold mb-6">Shipping Address</h2>
                            <div className="space-y-2 text-gray-600">
                                <p className="font-bold text-black">{order.shippingAddress.street}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                                <p>{order.shippingAddress.zipCode}</p>
                                <p>{order.shippingAddress.country}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
