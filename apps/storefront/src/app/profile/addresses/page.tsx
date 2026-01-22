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
        <>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 text-center">
                            <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-4">
                                {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
                            <p className="text-gray-500 text-sm">{user.email}</p>
                        </div>

                        <nav className="space-y-2">
                            <Link href="/profile" className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                                <div className="flex items-center space-x-3">
                                    <Package className="w-5 h-5" />
                                    <span>My Orders</span>
                                </div>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                            <Link href="/profile/addresses" className="w-full flex items-center justify-between p-4 bg-black text-white rounded-2xl font-bold">
                                <div className="flex items-center space-x-3">
                                    <MapPin className="w-5 h-5" />
                                    <span>Addresses</span>
                                </div>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                            <Link href="/profile/settings" className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                                <div className="flex items-center space-x-3">
                                    <UserIcon className="w-5 h-5" />
                                    <span>Account Settings</span>
                                </div>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-3xl font-black">MY ADDRESSES.</h1>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Add New</span>
                            </button>
                        </div>

                        {/* Add/Edit Form */}
                        {showAddForm && (
                            <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 mb-8">
                                <h2 className="text-xl font-bold mb-6">
                                    {editingId ? 'Edit Address' : 'Add New Address'}
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-2">Address Type</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-black outline-none transition-all"
                                            >
                                                <option value="Home">Home</option>
                                                <option value="Work">Work</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2">Street Address</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.street}
                                                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-black outline-none transition-all"
                                                placeholder="Enter street address"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2">City</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-black outline-none transition-all"
                                                placeholder="Enter city"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2">State</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.state}
                                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-black outline-none transition-all"
                                                placeholder="Enter state"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2">ZIP Code</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.zipCode}
                                                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-black outline-none transition-all"
                                                placeholder="Enter ZIP code"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2">Country</label>
                                            <input
                                                type="text"
                                                value={formData.country}
                                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-black outline-none transition-all"
                                                placeholder="Enter country"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex space-x-4 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all"
                                        >
                                            {editingId ? 'Update Address' : 'Save Address'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="px-8 py-4 border-2 border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all"
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
                                    <div key={i} className="h-40 bg-gray-100 rounded-3xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : addresses.length === 0 && !showAddForm ? (
                            <div className="text-center py-24 bg-gray-50 rounded-3xl">
                                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 mb-4">You haven't added any addresses yet.</p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="bg-black text-white px-8 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all"
                                >
                                    Add Your First Address
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {addresses.map((address) => (
                                    <div
                                        key={address._id}
                                        className={`bg-white border-2 rounded-3xl p-6 relative ${address.isDefault ? 'border-black' : 'border-gray-100'
                                            }`}
                                    >
                                        {address.isDefault && (
                                            <span className="absolute top-4 right-4 bg-black text-white text-xs font-bold px-3 py-1 rounded-full">
                                                DEFAULT
                                            </span>
                                        )}
                                        <div className="flex items-center space-x-2 mb-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${address.type === 'Home' ? 'bg-blue-100 text-blue-600' :
                                                    address.type === 'Work' ? 'bg-purple-100 text-purple-600' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {address.type.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="font-bold text-lg mb-1">{address.street}</p>
                                        <p className="text-gray-500">{address.city}, {address.state} {address.zipCode}</p>
                                        <p className="text-gray-500">{address.country}</p>

                                        <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
                                            {!address.isDefault && (
                                                <button
                                                    onClick={() => handleSetDefault(address._id)}
                                                    className="flex items-center space-x-1 text-sm font-bold text-gray-500 hover:text-black transition-all"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    <span>Set Default</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEdit(address)}
                                                className="flex items-center space-x-1 text-sm font-bold text-gray-500 hover:text-black transition-all"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                <span>Edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(address._id)}
                                                className="flex items-center space-x-1 text-sm font-bold text-red-500 hover:text-red-600 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
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
        </>
    );
}
