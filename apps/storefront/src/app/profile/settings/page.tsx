'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/utils/api';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { Package, MapPin, User as UserIcon, ChevronRight, Save, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
    const router = useRouter();
    const { user, isAuthenticated, setUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        phone: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        if (user) {
            setProfileData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || ''
            });
        }
    }, [isAuthenticated, router, user]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await api.put('/auth/profile', profileData);
            setUser(res.data.user);
            setSuccess('Profile updated successfully!');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            setLoading(false);
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            await api.put('/auth/profile', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setSuccess('Password updated successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
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
                            <Link href="/profile/addresses" className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                                <div className="flex items-center space-x-3">
                                    <MapPin className="w-5 h-5" />
                                    <span>Addresses</span>
                                </div>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                            <Link href="/profile/settings" className="w-full flex items-center justify-between p-4 bg-black text-white rounded-2xl font-bold">
                                <div className="flex items-center space-x-3">
                                    <UserIcon className="w-5 h-5" />
                                    <span>Account Settings</span>
                                </div>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        <h1 className="text-3xl font-black">ACCOUNT SETTINGS.</h1>

                        {/* Success/Error Messages */}
                        {success && (
                            <div className="bg-green-50 border-2 border-green-200 text-green-600 px-6 py-4 rounded-2xl font-bold">
                                {success}
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-50 border-2 border-red-200 text-red-600 px-6 py-4 rounded-2xl font-bold">
                                {error}
                            </div>
                        )}

                        {/* Profile Information */}
                        <div className="bg-white border-2 border-gray-100 rounded-3xl p-8">
                            <h2 className="text-xl font-bold mb-6">Profile Information</h2>
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2">First Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={profileData.firstName}
                                            onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                            className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-black outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={profileData.lastName}
                                            onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                            className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-black outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Email</label>
                                        <input
                                            type="email"
                                            disabled
                                            value={user.email}
                                            className="w-full p-4 border-2 border-gray-100 rounded-2xl bg-gray-50 text-gray-500 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-black outline-none transition-all"
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center justify-center space-x-2 bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50"
                                    >
                                        <Save className="w-5 h-5" />
                                        <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Change Password */}
                        <div className="bg-white border-2 border-gray-100 rounded-3xl p-8">
                            <h2 className="text-xl font-bold mb-6">Change Password</h2>
                            <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold mb-2">Current Password</label>
                                        <div className="relative">
                                            <input
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                required
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className="w-full p-4 pr-12 border-2 border-gray-100 rounded-2xl focus:border-black outline-none transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                                            >
                                                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? 'text' : 'password'}
                                                required
                                                minLength={6}
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="w-full p-4 pr-12 border-2 border-gray-100 rounded-2xl focus:border-black outline-none transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                                            >
                                                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Confirm New Password</label>
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-black outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center justify-center space-x-2 bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50"
                                    >
                                        <Save className="w-5 h-5" />
                                        <span>{loading ? 'Updating...' : 'Update Password'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
