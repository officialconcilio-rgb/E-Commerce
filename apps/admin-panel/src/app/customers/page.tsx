'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
    Search,
    User,
    Mail,
    Phone,
    Calendar,
    MoreHorizontal
} from 'lucide-react';

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
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
        fetchCustomers();
    }, []);

    const filteredCustomers = customers.filter((c: any) =>
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
                            ) : filteredCustomers.map((customer: any) => (
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
                                        <button className="p-2 hover:bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400 hover:text-[#1e1e2d]">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
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
