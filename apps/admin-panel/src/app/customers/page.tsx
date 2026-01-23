'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
    Search,
    User,
    Mail,
    Phone,
    Calendar,
    Eye,
    Trash2,
    X,
    ShoppingBag,
    IndianRupee,
    Clock,
    MapPin,
    CheckCircle,
    XCircle
} from 'lucide-react';

interface Customer {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    createdAt: string;
    isActive: boolean;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    lastLogin?: string;
    addresses?: Array<{
        type: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
    }>;
}

interface CustomerOrder {
    _id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    amount: number;
    date: string;
    itemCount: number;
}

interface CustomerStats {
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string | null;
}

interface CustomerDetails {
    customer: Customer;
    stats: CustomerStats;
    orders: CustomerOrder[];
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const fetchCustomers = async () => {
        try {
            const res = await api.get('/admin/customers');
            setCustomers(res.data.customers);
        } catch (error) {
            console.error('Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleView = async (customer: Customer) => {
        setIsModalOpen(true);
        setLoadingDetails(true);
        try {
            const res = await api.get(`/admin/customers/${customer._id}`);
            setSelectedCustomer(res.data);
        } catch (error) {
            console.error('Failed to fetch customer details');
            alert('Failed to load customer details');
            setIsModalOpen(false);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleDelete = async (customer: Customer) => {
        if (!confirm(`Are you sure you want to deactivate ${customer.firstName} ${customer.lastName}? They will no longer be able to login.`)) {
            return;
        }

        try {
            await api.delete(`/admin/customers/${customer._id}`);
            await fetchCustomers();
            alert('Customer deactivated successfully');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to deactivate customer');
        }
    };

    const filteredCustomers = customers.filter((c: Customer) =>
        c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm))
    );

    const getStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            'Pending': 'bg-yellow-100 text-yellow-700',
            'Processing': 'bg-blue-100 text-blue-700',
            'Shipped': 'bg-purple-100 text-purple-700',
            'Delivered': 'bg-green-100 text-green-700',
            'Cancelled': 'bg-red-100 text-red-700',
            'Paid': 'bg-green-100 text-green-700',
            'Failed': 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#1e1e2d] tracking-tight mb-2">CUSTOMERS.</h1>
                    <p className="text-gray-500">View your customer base</p>
                </div>
            </div>

            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-[#1e1e2d]/10 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                                <th className="px-6 pb-4">Customer</th>
                                <th className="px-6 pb-4">Contact</th>
                                <th className="px-6 pb-4">Joined Date</th>
                                <th className="px-6 pb-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-6 py-6"><div className="h-12 bg-gray-100 rounded-2xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                        No customers found
                                    </td>
                                </tr>
                            ) : filteredCustomers.map((customer: Customer) => (
                                <tr key={customer._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-[#1e1e2d] text-white rounded-full flex items-center justify-center font-bold">
                                                {customer.firstName[0]}{customer.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#1e1e2d]">{customer.firstName} {customer.lastName}</p>
                                                <p className="text-xs text-gray-400">ID: {customer._id.slice(-6)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <Mail className="w-4 h-4" />
                                                <span>{customer.email}</span>
                                            </div>
                                            {customer.phone && (
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Phone className="w-4 h-4" />
                                                    <span>+91 {customer.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center space-x-2 text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(customer.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleView(customer)}
                                                className="p-2 hover:bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400 hover:text-[#1e1e2d]"
                                                title="View Customer"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(customer)}
                                                className="p-2 hover:bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400 hover:text-red-500"
                                                title="Deactivate Customer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Customer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-2xl font-black text-[#1e1e2d]">Customer Details</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                            {loadingDetails ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1e1e2d] border-t-transparent"></div>
                                </div>
                            ) : selectedCustomer ? (
                                <div className="space-y-6">
                                    {/* Customer Info */}
                                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                                        <div className="w-16 h-16 bg-[#1e1e2d] text-white rounded-full flex items-center justify-center text-2xl font-bold">
                                            {selectedCustomer.customer.firstName[0]}{selectedCustomer.customer.lastName[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-[#1e1e2d]">
                                                {selectedCustomer.customer.firstName} {selectedCustomer.customer.lastName}
                                            </h3>
                                            <p className="text-gray-500">Customer since {new Date(selectedCustomer.customer.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {/* Contact & Verification */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-2xl">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-bold text-gray-500">Email</span>
                                                {selectedCustomer.customer.isEmailVerified ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-gray-300" />
                                                )}
                                            </div>
                                            <p className="text-[#1e1e2d] font-medium">{selectedCustomer.customer.email}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-bold text-gray-500">Phone</span>
                                                {selectedCustomer.customer.isPhoneVerified ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-gray-300" />
                                                )}
                                            </div>
                                            <p className="text-[#1e1e2d] font-medium">
                                                {selectedCustomer.customer.phone ? `+91 ${selectedCustomer.customer.phone}` : 'Not provided'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                                            <ShoppingBag className="w-6 h-6 text-blue-600 mb-2" />
                                            <p className="text-2xl font-black text-blue-900">{selectedCustomer.stats.totalOrders}</p>
                                            <p className="text-sm text-blue-600">Total Orders</p>
                                        </div>
                                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
                                            <IndianRupee className="w-6 h-6 text-green-600 mb-2" />
                                            <p className="text-2xl font-black text-green-900">₹{selectedCustomer.stats.totalSpent.toLocaleString()}</p>
                                            <p className="text-sm text-green-600">Total Spent</p>
                                        </div>
                                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                                            <Clock className="w-6 h-6 text-purple-600 mb-2" />
                                            <p className="text-sm font-bold text-purple-900">
                                                {selectedCustomer.stats.lastOrderDate
                                                    ? new Date(selectedCustomer.stats.lastOrderDate).toLocaleDateString()
                                                    : 'No orders'}
                                            </p>
                                            <p className="text-sm text-purple-600">Last Order</p>
                                        </div>
                                    </div>

                                    {/* Addresses */}
                                    {selectedCustomer.customer.addresses && selectedCustomer.customer.addresses.length > 0 && (
                                        <div>
                                            <h4 className="font-bold text-[#1e1e2d] mb-3 flex items-center">
                                                <MapPin className="w-5 h-5 mr-2" /> Saved Addresses
                                            </h4>
                                            <div className="space-y-2">
                                                {selectedCustomer.customer.addresses.map((addr, idx) => (
                                                    <div key={idx} className="p-3 bg-gray-50 rounded-xl text-sm">
                                                        <span className="inline-block px-2 py-1 bg-[#1e1e2d] text-white text-xs rounded-lg mr-2">
                                                            {addr.type}
                                                        </span>
                                                        {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Recent Orders */}
                                    <div>
                                        <h4 className="font-bold text-[#1e1e2d] mb-3 flex items-center">
                                            <ShoppingBag className="w-5 h-5 mr-2" /> Purchase History
                                        </h4>
                                        {selectedCustomer.orders.length === 0 ? (
                                            <p className="text-gray-400 text-center py-6">No orders yet</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {selectedCustomer.orders.map((order) => (
                                                    <div key={order._id} className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                                                        <div>
                                                            <p className="font-bold text-[#1e1e2d]">#{order.orderNumber}</p>
                                                            <p className="text-xs text-gray-400">
                                                                {new Date(order.date).toLocaleDateString()} • {order.itemCount} items
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-[#1e1e2d]">₹{order.amount?.toLocaleString()}</p>
                                                            <div className="flex space-x-2 mt-1">
                                                                <span className={`text-xs px-2 py-1 rounded-lg ${getStatusColor(order.status)}`}>
                                                                    {order.status}
                                                                </span>
                                                                <span className={`text-xs px-2 py-1 rounded-lg ${getStatusColor(order.paymentStatus)}`}>
                                                                    {order.paymentStatus}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
