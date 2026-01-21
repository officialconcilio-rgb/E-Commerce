'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
    Plus,
    Search,
    Trash2,
    X,
    Ticket,
    Percent,
    DollarSign
} from 'lucide-react';

export default function CouponsPage() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        code: '',
        discountType: 'Percentage',
        value: '',
        expiryDate: '',
        usageLimit: '',
        minOrderAmount: ''
    });

    const fetchCoupons = async () => {
        try {
            const res = await api.get('/admin/coupons');
            setCoupons(res.data.coupons);
        } catch (error) {
            console.error('Failed to fetch coupons');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/admin/coupons', formData);
            setIsModalOpen(false);
            setFormData({
                code: '',
                discountType: 'Percentage',
                value: '',
                expiryDate: '',
                usageLimit: '',
                minOrderAmount: ''
            });
            fetchCoupons();
        } catch (error) {
            alert('Failed to create coupon');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            await api.delete(`/admin/coupons/${id}`);
            fetchCoupons();
        } catch (error) {
            alert('Failed to delete coupon');
        }
    };

    const filteredCoupons = coupons.filter((c: any) =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#1e1e2d] tracking-tight mb-2">COUPONS.</h1>
                    <p className="text-gray-500">Manage discounts and promotions</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#1e1e2d] text-white px-8 py-4 rounded-2xl font-bold flex items-center space-x-3 shadow-xl shadow-[#1e1e2d]/20 hover:scale-[1.02] transition-all"
                >
                    <Plus className="w-5 h-5" />
                    <span>Create Coupon</span>
                </button>
            </div>

            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search coupons..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-[#1e1e2d]/10 transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="h-48 bg-gray-100 rounded-3xl animate-pulse"></div>
                        ))
                    ) : filteredCoupons.map((coupon: any) => (
                        <div key={coupon._id} className="bg-gray-50 rounded-3xl p-6 relative group hover:shadow-lg transition-all border border-transparent hover:border-gray-200">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-white p-3 rounded-xl shadow-sm">
                                    <Ticket className="w-6 h-6 text-[#1e1e2d]" />
                                </div>
                                <button
                                    onClick={() => handleDelete(coupon._id)}
                                    className="p-2 bg-white rounded-xl text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <h3 className="text-2xl font-black text-[#1e1e2d] mb-1">{coupon.code}</h3>
                            <div className="flex items-center space-x-2 text-gray-500 text-sm font-bold mb-4">
                                <span>{coupon.discountType === 'Percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}</span>
                                <span>•</span>
                                <span>{coupon.isActive ? 'Active' : 'Inactive'}</span>
                            </div>

                            <div className="space-y-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <div className="flex justify-between">
                                    <span>Expires</span>
                                    <span className="text-gray-600">{new Date(coupon.expiryDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Usage</span>
                                    <span className="text-gray-600">{coupon.usedCount} / {coupon.usageLimit || '∞'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-[#1e1e2d]">New Coupon</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Coupon Code</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 ring-[#1e1e2d]/10 font-mono"
                                    placeholder="SUMMER2026"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                                    <div className="flex bg-gray-50 p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, discountType: 'Percentage' })}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.discountType === 'Percentage' ? 'bg-white shadow-sm text-black' : 'text-gray-400'
                                                }`}
                                        >
                                            <Percent className="w-4 h-4 mx-auto" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, discountType: 'Fixed' })}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.discountType === 'Fixed' ? 'bg-white shadow-sm text-black' : 'text-gray-400'
                                                }`}
                                        >
                                            <DollarSign className="w-4 h-4 mx-auto" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Value</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 ring-[#1e1e2d]/10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Expiry Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.expiryDate}
                                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 ring-[#1e1e2d]/10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Usage Limit</label>
                                    <input
                                        type="number"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 ring-[#1e1e2d]/10"
                                        placeholder="Unlimited"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-[#1e1e2d] text-white py-4 rounded-xl font-bold mt-4 disabled:opacity-50"
                            >
                                {submitting ? 'Creating...' : 'Create Coupon'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
