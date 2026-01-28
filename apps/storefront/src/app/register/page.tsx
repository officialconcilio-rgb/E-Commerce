'use client';

import { useState, Suspense } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import { Mail, Lock, User, Phone, ArrowRight, Sparkles, Eye, EyeOff, ShieldCheck } from 'lucide-react';

function RegisterForm() {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [showOTPField, setShowOTPField] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuthStore();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (showOTPField) {
                // Step 2: Verify OTP
                const res = await api.post('/auth/login/verify', { email, otp });
                login(res.data.token, res.data.user);
                router.push('/');
            } else {
                // Step 1: Send OTP / Create Profile
                await api.post('/auth/register', {
                    email,
                    firstName,
                    lastName,
                    phone,
                    password
                });
                setShowOTPField(true);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative z-10 w-full max-w-2xl p-8 mx-auto">
            <div className="backdrop-blur-2xl bg-white/90 border border-white/20 rounded-[3rem] shadow-2xl p-10 lg:p-14 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-3xl" />

                <div className="relative">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-amber-50 rounded-full mb-6 border border-purple-100/50 shadow-sm">
                            <ShieldCheck className="w-4 h-4 text-purple-600" />
                            <span className="text-purple-600 text-[10px] font-black uppercase tracking-[0.2em]">Join the Heritage</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                            Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-amber-600">Account</span>
                        </h1>
                        <p className="text-gray-500 font-medium text-lg">Experience gifting reimagined</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl mb-10 text-sm font-bold flex items-center gap-3 animate-in fade-in zoom-in-95">
                            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {!showOTPField && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">First Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-200 focus:bg-white rounded-2xl outline-none transition-all duration-300 font-medium"
                                            placeholder="John"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Last Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-200 focus:bg-white rounded-2xl outline-none transition-all duration-300 font-medium"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                        <span className="absolute left-11 top-1/2 -translate-y-1/2 text-gray-400 font-bold border-r pr-2">+91</span>
                                        <input
                                            type="tel"
                                            required
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="w-full pl-24 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-200 focus:bg-white rounded-2xl outline-none transition-all duration-300 font-semibold"
                                            placeholder="00000 00000"
                                            maxLength={10}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-200 focus:bg-white rounded-2xl outline-none transition-all duration-300 font-medium"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-200 focus:bg-white rounded-2xl outline-none transition-all duration-300 font-medium"
                                            placeholder="Create a strong password"
                                            minLength={6}
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
                            </div>
                        )}

                        {showOTPField && (
                            <div className="space-y-6 py-6 animate-in zoom-in-95 duration-500">
                                <div className="text-center space-y-2">
                                    <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                                        <Mail className="w-10 h-10 text-purple-600" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900">Verify Email</h3>
                                    <p className="text-gray-500 font-medium">Enter the 6-digit code sent to<br /><span className="text-purple-600 font-black">{email}</span></p>
                                </div>
                                <div className="flex justify-center">
                                    <input
                                        type="text"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full max-w-[320px] py-6 bg-gray-50 border-2 border-transparent focus:border-purple-200 rounded-3xl outline-none transition-all duration-300 text-4xl font-black tracking-[0.5em] text-center shadow-inner"
                                        placeholder="000000"
                                        maxLength={6}
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowOTPField(false)}
                                    className="w-full text-xs font-black uppercase tracking-widest text-gray-400 hover:text-purple-600 transition-colors"
                                >
                                    Change Registration Details
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group relative py-6 bg-gray-900 text-white rounded-3xl font-black text-xl overflow-hidden transition-all duration-500 hover:bg-purple-600 hover:shadow-2xl hover:shadow-purple-200 active:scale-[0.98] disabled:opacity-70"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-4">
                                {loading ? (
                                    <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {showOTPField ? 'Complete Setup' : 'Create My Account'}
                                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-14 text-center">
                        <p className="text-gray-500 font-bold">
                            Already part of our brand?{' '}
                            <Link href="/login" className="text-purple-700 font-black hover:underline inline-flex items-center gap-2 group/link">
                                Sign In
                                <span className="text-amber-500 transition-transform group-hover:scale-125">✦</span>
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Premium Badges */}
            <div className="flex flex-wrap justify-center gap-10 mt-12 px-6">
                {[
                    { icon: '✨', label: 'Artisan Crafted' },
                    { icon: '🔒', label: '100% Secure' },
                    { icon: '🌍', label: 'Global Delivery' }
                ].map((badge, i) => (
                    <div key={i} className="flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm opacity-60 hover:opacity-100 transition-opacity duration-500">
                        <span className="text-xl">{badge.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">{badge.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
            {/* Background Image with Deep Overlay */}
            <div className="absolute inset-0 z-0 scale-110 blur-[2px] opacity-40">
                <Image
                    src="/images/auth-bg.png"
                    alt="Background"
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                />
            </div>

            <Navbar />

            <main className="flex-1 flex items-center justify-center relative py-20">
                <Suspense fallback={null}>
                    <RegisterForm />
                </Suspense>
            </main>

            {/* Static background particles */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-[120px]" />
            </div>
        </div>
    );
}
