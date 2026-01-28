'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/utils/api';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { Package, MapPin, User as UserIcon, ChevronRight, Plus, Edit2, Trash2, Check } from 'lucide-react';
import Link from 'next/link';

interface Address {
    _id: string;
    type: 'Home' | 'Work' | 'Other';
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
}

export default function AddressesPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        type: 'Home',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
    });

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchAddresses();
    }, [isAuthenticated, router]);

    const fetchAddresses = async () => {
        try {
            const res = await api.get('/auth/addresses');
            setAddresses(res.data.addresses || []);
        } catch (error) {
            console.error('Failed to fetch addresses');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/auth/address/${editingId}`, formData);
            } else {
                await api.post('/auth/address', formData);
            }
            await fetchAddresses();
            resetForm();
        } catch (error) {
            console.error('Failed to save address');
        }
    };

    const handleEdit = (address: Address) => {
        setFormData({
            type: address.type,
            street: address.street,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
            country: address.country
        });
        setEditingId(address._id);
        setShowAddForm(true);
    };

    const handleDelete = async (addressId: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            await api.delete(`/auth/address/${addressId}`);
            await fetchAddresses();
        } catch (error) {
            console.error('Failed to delete address');
        }
    };

    const handleSetDefault = async (addressId: string) => {
        try {
            await api.put(`/auth/address/${addressId}/default`);
            await fetchAddresses();
        } catch (error) {
            console.error('Failed to set default address');
        }
    };

    const resetForm = () => {
        setFormData({
            type: 'Home',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'India'
        });
        setShowAddForm(false);
        setEditingId(null);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="container-main py-3">
                    <nav className="text-sm text-gray-500">
                        <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/profile" className="hover:text-amber-600 transition-colors">My Account</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-800">Addresses</span>
                    </nav>
                </div>
            </div>

            <div className="container-main py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-24">
                            {/* User Info */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xl font-bold">
                                        {user.firstName[0]}{user.lastName[0]}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{user.firstName} {user.lastName}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Menu */}
                            <nav className="p-2">
                                <Link
                                    href="/profile"
                                    className="flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Package className="w-5 h-5" />
                                        <span className="font-medium">My Orders</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </Link>
                                <Link
                                    href="/profile/addresses"
                                    className="flex items-center justify-between p-3 rounded-lg bg-amber-50 text-amber-600 font-semibold shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-5 h-5" />
                                        <span className="font-medium">Addresses</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/profile/settings"
                                    className="flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <UserIcon className="w-5 h-5" />
                                        <span className="font-medium">Account Settings</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </Link>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-8">
                                <h1 className="text-xl font-bold text-gray-800">My Addresses</h1>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="btn-primary py-2 px-6 flex items-center gap-2 text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add New
                                </button>
                            </div>

                            {/* Add/Edit Form */}
                            {showAddForm && (
                                <div className="bg-amber-50/50 border-2 border-amber-100 rounded-2xl p-6 mb-8">
                                    <h2 className="text-lg font-bold text-gray-800 mb-6">
                                        {editingId ? 'Edit Address' : 'Add New Address'}
                                    </h2>
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                                                <div className="flex gap-2">
                                                    {(['Home', 'Work', 'Other'] as const).map((type) => (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, type })}
                                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === type
                                                                ? 'bg-amber-600 text-white shadow-sm'
                                                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.street}
                                                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-sm"
                                                    placeholder="Enter street address"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-sm"
                                                    placeholder="Enter city"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.state}
                                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-sm"
                                                    placeholder="Enter state"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.zipCode}
                                                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-sm"
                                                    placeholder="Enter ZIP code"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                                <input
                                                    type="text"
                                                    value={formData.country}
                                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-sm"
                                                    placeholder="Enter country"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="submit"
                                                className="btn-primary py-3 px-8 text-sm"
                                            >
                                                {editingId ? 'Update Address' : 'Save Address'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={resetForm}
                                                className="px-6 py-3 border border-gray-200 rounded-xl font-bold text-sm hover:bg-white transition-all text-gray-600"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {loading ? (
                                <div className="space-y-4">
                                    {[...Array(2)].map((_, i) => (
                                        <div key={i} className="h-32 bg-gray-50 rounded-2xl animate-pulse"></div>
                                    ))}
                                </div>
                            ) : addresses.length === 0 && !showAddForm ? (
                                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                                    <div className="w-16 h-16 bg-amber-100/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MapPin className="w-8 h-8 text-amber-600/50" />
                                    </div>
                                    <p className="text-gray-500 mb-6">You haven't added any addresses yet.</p>
                                    <button
                                        onClick={() => setShowAddForm(true)}
                                        className="btn-primary py-3 px-8 text-sm transition-all"
                                    >
                                        Add Your First Address
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {addresses.map((address) => (
                                        <div
                                            key={address._id}
                                            className={`bg-white border-2 rounded-2xl p-5 relative transition-all hover:shadow-md ${address.isDefault ? 'border-amber-600 ring-1 ring-amber-600' : 'border-gray-100 hover:border-amber-200'
                                                }`}
                                        >
                                            {address.isDefault && (
                                                <span className="absolute top-4 right-4 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                                    DEFAULT
                                                </span>
                                            )}
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${address.type === 'Home' ? 'bg-blue-100 text-blue-600' :
                                                    address.type === 'Work' ? 'bg-purple-100 text-purple-600' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {address.type.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="font-bold text-gray-800 mb-1">{address.street}</p>
                                            <p className="text-sm text-gray-500">{address.city}, {address.state} {address.zipCode}</p>
                                            <p className="text-sm text-gray-500">{address.country}</p>

                                            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-50">
                                                {!address.isDefault && (
                                                    <button
                                                        onClick={() => handleSetDefault(address._id)}
                                                        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-amber-600 transition-all"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                        <span>Set Default</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEdit(address)}
                                                    className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-amber-600 transition-all"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(address._id)}
                                                    className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </div>
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
