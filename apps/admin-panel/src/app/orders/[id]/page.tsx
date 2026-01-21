'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import {
    ArrowLeft,
    Package,
    Truck,
    CheckCircle,
    Clock,
    MapPin,
    User,
    CreditCard,
    Save
} from 'lucide-react';

export default function OrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/admin/orders/${id}`);
                setOrder(res.data.order);
                setStatus(res.data.order.status);
            } catch (error) {
                console.error('Failed to fetch order');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleStatusUpdate = async () => {
        setUpdating(true);
        try {
            await api.patch(`/admin/orders/${id}/status`, { status });
            alert('Order status updated successfully');
        } catch (error) {
            alert('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-12 text-center">Loading...</div>;
    if (!order) return <div className="p-12 text-center">Order not found</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-[#1e1e2d] tracking-tight">ORDER #{order.orderNumber}</h1>
                    <p className="text-gray-500">View and manage order details</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Status Card */}
                    <div className="card p-8">
                        <h2 className="text-xl font-bold mb-6">Order Status</h2>
                        <div className="flex items-center space-x-4">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="flex-1 px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 ring-[#1e1e2d]/10 font-bold"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            <button
                                onClick={handleStatusUpdate}
                                disabled={updating || status === order.status}
                                className="bg-[#1e1e2d] text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 flex items-center space-x-2"
                            >
                                <Save className="w-4 h-4" />
                                <span>Update</span>
                            </button>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="card p-8">
                        <h2 className="text-xl font-bold mb-6">Order Items</h2>
                        <div className="space-y-6">
                            {order.items.map((item: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-gray-300">
                                            <Package className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#1e1e2d]">{item.name}</p>
                                            <p className="text-sm text-gray-500">SKU: {item.sku} | Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold">₹{item.price * item.quantity}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                            <span className="font-bold text-gray-500">Total Amount</span>
                            <span className="text-2xl font-black text-[#1e1e2d]">₹{order.finalAmount}</span>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Customer */}
                    <div className="card p-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                            <User className="w-5 h-5" />
                            <span>Customer</span>
                        </h2>
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-[#1e1e2d] text-white rounded-full flex items-center justify-center font-bold">
                                {order.userId?.firstName?.[0]}{order.userId?.lastName?.[0]}
                            </div>
                            <div>
                                <p className="font-bold">{order.userId?.firstName} {order.userId?.lastName}</p>
                                <p className="text-sm text-gray-500">{order.userId?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping */}
                    <div className="card p-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                            <MapPin className="w-5 h-5" />
                            <span>Shipping Address</span>
                        </h2>
                        <div className="text-gray-600 space-y-1">
                            <p className="font-bold text-[#1e1e2d]">{order.shippingAddress.street}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                            <p>{order.shippingAddress.zipCode}</p>
                            <p>{order.shippingAddress.country}</p>
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="card p-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                            <CreditCard className="w-5 h-5" />
                            <span>Payment Info</span>
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Method</span>
                                <span className="font-bold">{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status</span>
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                            {order.paymentId && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Transaction ID</span>
                                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{order.paymentId}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
