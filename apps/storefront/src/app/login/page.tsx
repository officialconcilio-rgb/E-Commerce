'use client';

import { useState, Suspense } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import { Mail, Lock, Eye, EyeOff, Gift, Sparkles, User, Phone } from 'lucide-react';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTPField, setShowOTPField] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showGoogleModal, setShowGoogleModal] = useState(false);

    const { login } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const mockAccounts = [
        { email: 'agarwalansh154@gmail.com', name: 'Ansh Agarwal', avatar: 'AA' },
        { email: 'google.demo@vagmi.com', name: 'Google User', avatar: 'GU' },
        { email: 'test.user@gmail.com', name: 'Test User', avatar: 'TU' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!showOTPField) {
                // Step 1: Send OTP
                await api.post('/auth/login/email', {
                    email,
                    firstName,
                    lastName,
                    phone
                });
                setShowOTPField(true);
            } else {
                // Step 2: Verify OTP
                const res = await api.post('/auth/login/verify', { email, otp });
                login(res.data.token, res.data.user);
                router.push(redirect);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Action failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        setError('');
        setShowGoogleModal(true);
    };

    const performGoogleLogin = async (account: typeof mockAccounts[0]) => {
        setShowGoogleModal(false);
        setGoogleLoading(true);

        try {
            // Simulated delay for "Google" feel
            await new Promise(resolve => setTimeout(resolve, 1500));

            const res = await api.post('/auth/google-simulated', {
                email: account.email,
                firstName: account.name.split(' ')[0],
                lastName: account.name.split(' ')[1] || '',
                googleId: 'simulated_' + Math.random().toString(36).substr(2, 9)
            });

            login(res.data.token, res.data.user);
            router.push(redirect);
        } catch (err: any) {
            setError('Google login failed. Please try traditional login.');
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
            <div className="w-full max-w-md">
                {/* Mobile Logo */}
                <div className="lg:hidden text-center mb-8">
                    <Link href="/" className="inline-block">
                        <span className="relative inline-block">
                            <span
                                className="text-5xl font-allura tracking-wide italic leading-none"
                                style={{
                                    fontFamily: 'var(--font-allura), cursive',
                                    background: 'linear-gradient(135deg, #581c87 0%, #7c3aed 25%, #a855f7 50%, #c026d3 75%, #d97706 100%)',
                                    WebkitBackgroundClip: 'text',
                                    backgroundClip: 'text',
                                    color: 'transparent',
                                    filter: 'drop-shadow(0 2px 4px rgba(124, 58, 237, 0.3))',
                                }}
                            >
                                Vagmi
                            </span>
                            <span
                                className="absolute -top-1 -right-2 text-amber-400 animate-pulse"
                                style={{ fontSize: '8px' }}
                            >
                                ✦
                            </span>
                        </span>
                    </Link>
                </div>

                {/* Premium Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100/80 rounded-full mb-4">
                        <span className="text-purple-600 text-sm font-medium">✦ Premium Account</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-3 font-heading">
                        Welcome Back
                    </h1>
                    <p className="text-gray-500">Sign in to continue your gifting journey</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                        <span className="text-red-500">⚠️</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!showOTPField && (
                        <>
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-amber-500 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity" />
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="relative w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 transition-all outline-none bg-white"
                                            placeholder="John"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-amber-500 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity" />
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="relative w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 transition-all outline-none bg-white"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Phone Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-amber-500 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity" />
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                    <span className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+91</span>
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        className="relative w-full pl-20 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 transition-all outline-none bg-white"
                                        placeholder="9876543210"
                                        maxLength={10}
                                    />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-amber-500 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity" />
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="relative w-full px-12 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none bg-white"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* OTP Field (Conditionally shown) */}
                    {showOTPField && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Verification Code
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-amber-500 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity" />
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="relative w-full px-12 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none bg-white font-bold tracking-[0.3em]"
                                    placeholder="000000"
                                    maxLength={6}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Please enter the 6-digit code sent to your email.
                                <button
                                    type="button"
                                    onClick={() => setShowOTPField(false)}
                                    className="ml-2 text-purple-600 hover:underline"
                                >
                                    Change email
                                </button>
                            </p>
                        </div>
                    )}

                    {!showOTPField && (
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded-md border-2 border-gray-300 text-purple-600 focus:ring-purple-500 transition-colors"
                                />
                                <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Remember me</span>
                            </label>
                        </div>
                    )}

                    {/* Premium Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="relative w-full py-4 rounded-xl text-white font-semibold text-base overflow-hidden group transition-all duration-300 disabled:opacity-70"
                        style={{
                            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c026d3 100%)',
                        }}
                    >
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {showOTPField ? 'Verifying...' : 'Sending code...'}
                                </>
                            ) : (
                                <>
                                    {showOTPField ? 'Verify & Sign In' : 'Send Verification Code'}
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </>
                            )}
                        </span>
                    </button>
                </form>

                {/* Divider */}
                <div className="my-8 flex items-center">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    <span className="px-4 text-sm text-gray-400 font-medium">or continue with</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                </div>

                {/* Social Login */}
                <div className="space-y-3">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                        className="w-full py-4 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-70"
                    >
                        {googleLoading ? (
                            <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        <span className="group-hover:text-purple-700 transition-colors">
                            {googleLoading ? 'Signing in...' : 'Continue with Google'}
                        </span>
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-10 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link
                            href="/register"
                            className="text-purple-600 font-bold hover:text-purple-800 transition-colors inline-flex items-center gap-1"
                        >
                            Create Account
                            <span className="text-xs">✦</span>
                        </Link>
                    </p>
                </div>
                {/* Google Account Selector Modal */}
                {showGoogleModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-[360px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            {/* Google Branding Header */}
                            <div className="p-6 text-center border-b border-gray-100">
                                <div className="flex justify-center mb-4">
                                    <svg className="w-8 h-8" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-medium text-gray-900">Choose an account</h3>
                                <p className="text-sm text-gray-500 mt-1">to continue to Vagmi</p>
                            </div>

                            {/* Account List */}
                            <div className="py-2">
                                {mockAccounts.map((account) => (
                                    <button
                                        key={account.email}
                                        onClick={() => performGoogleLogin(account)}
                                        className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform">
                                            {account.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{account.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{account.email}</p>
                                        </div>
                                        <div className="text-gray-300 group-hover:text-purple-500 transition-colors">
                                            <span className="text-xl">›</span>
                                        </div>
                                    </button>
                                ))}

                                <button
                                    onClick={() => setShowGoogleModal(false)}
                                    className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors text-left border-t border-gray-100 group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shadow-sm group-hover:scale-105 transition-transform">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">Use another account</p>
                                </button>
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-gray-50 text-[11px] text-gray-500 text-center leading-relaxed">
                                To continue, Google will share your name, email address, language preference, and profile picture with Vagmi.
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="min-h-[calc(100vh-120px)] flex">
                {/* Left Side - Premium Image Panel */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                    {/* Multi-layer gradient background */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'linear-gradient(135deg, #581c87 0%, #7c3aed 20%, #a855f7 40%, #c026d3 60%, #db2777 80%, #f97316 100%)',
                        }}
                    />

                    {/* Background image with blend */}
                    <div className="absolute inset-0 opacity-30 mix-blend-overlay">
                        <Image
                            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920&q=90&fit=crop"
                            alt="Beautiful Gifts"
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Animated floating particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
                        <div className="absolute top-40 right-20 w-24 h-24 bg-amber-400/20 rounded-full blur-xl animate-bounce" style={{ animationDuration: '3s' }} />
                        <div className="absolute bottom-32 left-20 w-40 h-40 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                        <div className="absolute bottom-20 right-10 w-20 h-20 bg-pink-400/20 rounded-full blur-xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />

                        {/* Decorative sparkles */}
                        <span className="absolute top-16 right-32 text-amber-300/60 text-2xl animate-pulse">✦</span>
                        <span className="absolute top-48 left-24 text-white/40 text-lg animate-pulse" style={{ animationDelay: '0.5s' }}>✦</span>
                        <span className="absolute bottom-40 right-40 text-pink-300/50 text-xl animate-pulse" style={{ animationDelay: '1s' }}>✦</span>
                        <span className="absolute bottom-24 left-40 text-amber-400/40 text-sm animate-pulse" style={{ animationDelay: '1.5s' }}>✦</span>
                    </div>

                    {/* Content with glassmorphism card */}
                    <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white w-full">
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-8">
                            <span className="relative inline-block">
                                <span
                                    className="text-7xl font-allura tracking-wide italic leading-none"
                                    style={{
                                        fontFamily: 'var(--font-allura), cursive',
                                        background: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 25%, #f59e0b 50%, #fbbf24 75%, #ffffff 100%)',
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        color: 'transparent',
                                        filter: 'drop-shadow(0 4px 12px rgba(251, 191, 36, 0.5))',
                                    }}
                                >
                                    Vagmi
                                </span>
                                <span
                                    className="absolute -top-2 -right-3 text-amber-300 animate-pulse"
                                    style={{ fontSize: '14px' }}
                                >
                                    ✦
                                </span>
                            </span>
                        </div>

                        {/* Headlines */}
                        <h2 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight font-heading">
                            Welcome Back to<br />
                            <span
                                style={{
                                    background: 'linear-gradient(90deg, #fcd34d 0%, #f59e0b 50%, #fbbf24 100%)',
                                    WebkitBackgroundClip: 'text',
                                    backgroundClip: 'text',
                                    color: 'transparent',
                                }}
                            >
                                Your Gift Destination
                            </span>
                        </h2>
                        <p className="text-white/90 text-lg max-w-md leading-relaxed mb-10">
                            Discover thoughtfully curated gifts that celebrate culture, tradition, and heartfelt emotions.
                        </p>

                        {/* Feature cards with glassmorphism */}
                        <div className="space-y-4">
                            {[
                                { icon: '💎', text: 'Exclusive member discounts', delay: '0s' },
                                { icon: '✨', text: 'Early access to new collections', delay: '0.1s' },
                                { icon: '🎁', text: 'Track your orders easily', delay: '0.2s' },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:scale-105"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                    }}
                                >
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(217, 119, 6, 0.3) 100%)',
                                            border: '1px solid rgba(251, 191, 36, 0.3)',
                                        }}
                                    >
                                        {item.icon}
                                    </div>
                                    <span className="text-white font-medium">{item.text}</span>
                                </div>
                            ))}
                        </div>

                        {/* Decorative bottom element */}
                        <div className="mt-12 pt-8 border-t border-white/20">
                            <p className="text-white/60 text-sm">
                                Trusted by <span className="text-amber-300 font-semibold">10,000+</span> happy customers worldwide
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <Suspense fallback={
                    <div className="w-full lg:w-1/2 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin"></div>
                    </div>
                }>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    );
}
