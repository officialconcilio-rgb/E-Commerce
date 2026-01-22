'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import Link from 'next/link';
import {
    Search,
    Eye,
    Download,
    MoreHorizontal,
    Calendar,
    Package
} from 'lucide-react';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/admin/orders'); // We'll need to implement this endpoint or use a general one
                setOrders(res.data.orders);
            } catch (error) {
                console.error('Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleExportCSV = async () => {
        try {
            setExporting(true);
            const response = await api.get('/admin/orders/export', {
                responseType: 'blob'
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `orders_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export CSV:', error);
            alert('Failed to export orders. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-600';
            case 'Shipped': return 'bg-blue-100 text-blue-600';
            case 'Pending': return 'bg-yellow-100 text-yellow-600';
            case 'Cancelled': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#1e1e2d] tracking-tight mb-2">ORDERS.</h1>
                    <p className="text-gray-500">Track and manage customer orders</p>
                </div>
                <div className="flex space-x-4">
                    <button
                        onClick={handleExportCSV}
                        disabled={exporting}
                        className="bg-white border-2 border-gray-100 px-6 py-4 rounded-2xl font-bold flex items-center space-x-3 hover:border-[#1e1e2d] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className={`w-5 h-5 ${exporting ? 'animate-pulse' : ''}`} />
                        <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
                    </button>
                </div>
            </div>

            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Order ID or Customer..."
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-[#1e1e2d]/10 transition-all"
                        />
                    </div>
                    <div className="flex space-x-4">
                        <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-2xl">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <span className="text-sm font-bold">This Month</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                                <th className="px-6 pb-4">Order Details</th>
                                <th className="px-6 pb-4">Customer</th>
                                <th className="px-6 pb-4">Amount</th>
                                <th className="px-6 pb-4">Payment</th>
                                <th className="px-6 pb-4">Status</th>
                                <th className="px-6 pb-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-6"><div className="h-12 bg-gray-100 rounded-2xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : orders.map((order: any) => (
                                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-6">
                                        <div>
                                            <p className="font-bold text-[#1e1e2d]">{order.orderNumber}</p>
                                            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-[#1e1e2d] text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                                {order.userId?.firstName?.[0]}{order.userId?.lastName?.[0]}
                                            </div>
                                            <p className="font-medium text-sm">{order.userId?.firstName} {order.userId?.lastName}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 font-bold">₹{order.finalAmount}</td>
                                    <td className="px-6 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                            {order.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <Link href={`/orders/${order._id}`} className="p-2 hover:bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400 hover:text-[#1e1e2d] inline-block">
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
