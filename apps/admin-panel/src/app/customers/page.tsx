'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
    Search,
    User,
    Mail,
    Phone,
    Calendar,
    Edit2,
    Trash2,
    X,
    Save
} from 'lucide-react';

interface Customer {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    createdAt: string;
    isActive: boolean;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: ''
    });

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

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setFormData({
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phone || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCustomer) return;

        setSubmitting(true);
        try {
            await api.put(`/admin/customers/${editingCustomer._id}`, formData);
            setIsModalOpen(false);
            setEditingCustomer(null);
            await fetchCustomers();
            alert('Customer updated successfully');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update customer');
        } finally {
            setSubmitting(false);
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
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#1e1e2d] tracking-tight mb-2">CUSTOMERS.</h1>
                    <p className="text-gray-500">View and manage your customer base</p>
                </div>
            </div>

            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
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
                                                    <span>{customer.phone}</span>
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
                                                onClick={() => handleEdit(customer)}
                                                className="p-2 hover:bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400 hover:text-[#1e1e2d]"
                                                title="Edit Customer"
                                            >
                                                <Edit2 className="w-4 h-4" />
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

            {/* Edit Customer Modal */}
            {isModalOpen && editingCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-[#1e1e2d]">Edit Customer</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 ring-[#1e1e2d]/10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 ring-[#1e1e2d]/10"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    disabled
                                    value={editingCustomer.email}
                                    className="w-full px-4 py-3 bg-gray-100 text-gray-500 border-none rounded-xl cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 ring-[#1e1e2d]/10"
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-[#1e1e2d] text-white py-4 rounded-xl font-bold mt-4 disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                <Save className="w-5 h-5" />
                                <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
