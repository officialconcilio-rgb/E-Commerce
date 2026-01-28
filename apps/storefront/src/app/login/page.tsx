'use client';

import { useState, Suspense } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import { Mail, Lock, Eye, EyeOff, Sparkles, User, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [showOTPField, setShowOTPField] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLoginWithPassword, setIsLoginWithPassword] = useState(true);

    const { login } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (showOTPField) {
                // Verify OTP
                const res = await api.post('/auth/login/verify', { email, otp });
                login(res.data.token, res.data.user);
                router.push(redirect);
            } else if (isLoginWithPassword && password) {
                // Password Login
                const res = await api.post('/auth/login', { email, password });
                login(res.data.token, res.data.user);
                router.push(redirect);
            } else {
                // Send OTP
                await api.post('/auth/login/email', { email, firstName, lastName, phone });
                setShowOTPField(true);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative z-10 w-full max-w-xl p-8 mx-auto">
            {/* Glassmorphism Card */}
            <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-[2.5rem] shadow-2xl p-10 overflow-hidden relative group">
                {/* Decorative gradients */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors duration-700" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors duration-700" />

                <div className="relative">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 rounded-full mb-6 border border-purple-100">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            <span className="text-purple-600 text-xs font-bold uppercase tracking-widest">Premium Access</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight font-heading">
                            Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-amber-600">Back</span>
                        </h1>
                        <p className="text-gray-500 font-medium">Elevate your gifting experience with Vagmi</p>
                    </div>

                    {/* Login Mode Toggle */}
                    {!showOTPField && (
                        <div className="flex p-1.5 bg-gray-100/50 rounded-2xl mb-8 border border-gray-200/50">
                            <button
                                onClick={() => setIsLoginWithPassword(true)}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${isLoginWithPassword ? 'bg-white text-purple-600 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Password
                            </button>
                            <button
                                onClick={() => setIsLoginWithPassword(false)}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${!isLoginWithPassword ? 'bg-white text-purple-600 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                OTP Login
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 px-4 py-4 rounded-2xl mb-8 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs">!</span>
                            </div>
                            <p className="font-semibold">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!showOTPField && (
                            <>
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                    <div className="relative group/field">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/field:text-purple-600 transition-colors" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-white/50 border-2 border-transparent group-focus-within/field:border-purple-200 group-focus-within/field:bg-white rounded-2xl outline-none transition-all duration-300 shadow-sm"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                {isLoginWithPassword ? (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-sm font-bold text-gray-700">Password</label>
                                            <Link href="/forgot-password" title="sm" className="text-xs text-purple-600 font-bold hover:underline">
                                                Forgot?
                                            </Link>
                                        </div>
                                        <div className="relative group/field">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/field:text-purple-600 transition-colors" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-12 pr-12 py-4 bg-white/50 border-2 border-transparent group-focus-within/field:border-purple-200 group-focus-within/field:bg-white rounded-2xl outline-none transition-all duration-300 shadow-sm"
                                                placeholder="Enter your password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-center text-gray-500 bg-purple-50 p-4 rounded-2xl border border-purple-100">
                                        A secure one-time password will be sent to your email address for verification.
                                    </p>
                                )}
                            </>
                        )}

                        {showOTPField && (
                            <div className="space-y-4 animate-in zoom-in-95 duration-300">
                                <div className="text-center p-6 bg-purple-50 rounded-3xl border border-purple-100 mb-6">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                        <Mail className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <h3 className="font-bold text-gray-900">Verify your Access</h3>
                                    <p className="text-sm text-gray-500 mt-1">We've sent a 6-digit code to <span className="text-purple-600 font-bold">{email}</span></p>
                                </div>
                                <div className="relative group/field">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/field:text-purple-600 transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full pl-12 pr-4 py-5 bg-white border-2 border-transparent focus:border-purple-200 rounded-2xl outline-none transition-all duration-300 shadow-sm text-2xl font-black tracking-[0.5em] text-center"
                                        placeholder="000000"
                                        maxLength={6}
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowOTPField(false)}
                                    className="w-full text-sm text-gray-500 font-bold hover:text-purple-600 transition-colors"
                                >
                                    Back to login options
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group relative py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 hover:bg-purple-600 hover:shadow-xl hover:shadow-purple-200 active:scale-[0.98] disabled:opacity-70"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {loading ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {showOTPField ? 'Sign In Now' : (isLoginWithPassword ? 'Secure Sign In' : 'Send Code')}
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-10 text-center">
                        <p className="text-gray-600 font-medium">
                            First time here?{' '}
                            <Link href="/register" className="text-purple-600 font-black hover:underline inline-flex items-center gap-1 group/link">
                                Create Account
                                <span className="group-hover:translate-x-0.5 transition-transform duration-300">✦</span>
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Trust Icons */}
            <div className="flex justify-center gap-12 mt-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Secure Payments</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Handcrafted Excellence</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Global Shipping</span>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/auth-bg.png"
                    alt="Background"
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/40 via-purple-900/10 to-transparent backdrop-blur-[2px]" />
            </div>

            <Navbar />

            <main className="flex-1 flex items-center justify-center relative">
                <Suspense fallback={
                    <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                }>
                    <LoginForm />
                </Suspense>
            </main>

            {/* Decorative dots */}
            <div className="absolute top-24 left-10 w-24 h-24 grid grid-cols-4 gap-4 opacity-10">
                {[...Array(16)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 bg-black rounded-full" />
                ))}
            </div>
        </div>
    );
}

