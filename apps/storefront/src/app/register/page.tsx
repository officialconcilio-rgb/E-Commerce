'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/utils/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Mail, Lock, ArrowRight, Phone, Check, RefreshCw } from 'lucide-react';

type Step = 'phone' | 'otp' | 'email' | 'email-sent' | 'password';

function RegisterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const loginStore = useAuthStore((state) => state.login);

    const [step, setStep] = useState<Step>('phone');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        otp: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [tempToken, setTempToken] = useState('');

    // Check for email verification token in URL
    useEffect(() => {
        const token = searchParams.get('verified');
        const tempTokenFromUrl = searchParams.get('tempToken');
        if (token === 'true' && tempTokenFromUrl) {
            setTempToken(tempTokenFromUrl);
            setStep('password');
        }
    }, [searchParams]);

    // Resend timer countdown
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const phoneClean = formData.phone.replace(/[\s\-]/g, '').replace(/^\+?91/, '');
            await api.post('/auth/register/phone', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: phoneClean
            });
            setFormData({ ...formData, phone: phoneClean });
            setStep('otp');
            setResendTimer(60);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleOTPSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/register/verify-phone', {
                phone: formData.phone,
                otp: formData.otp
            });
            setStep('email');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/register/email', {
                phone: formData.phone,
                email: formData.email
            });
            setStep('email-sent');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send verification email');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const res = await api.post('/auth/register/set-password', {
                tempToken,
                password: formData.password
            });
            loginStore(res.data.token, res.data.user);
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to set password');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return;
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/register/resend-otp', { phone: formData.phone });
            setResendTimer(60);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        if (resendTimer > 0) return;
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/register/resend-email', {
                phone: formData.phone,
                email: formData.email
            });
            setResendTimer(60);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend email');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { key: 'phone', label: 'Phone', num: 1 },
        { key: 'otp', label: 'Verify', num: 2 },
        { key: 'email', label: 'Email', num: 3 },
        { key: 'password', label: 'Password', num: 4 }
    ];

    const getCurrentStepIndex = () => {
        if (step === 'phone') return 0;
        if (step === 'otp') return 1;
        if (step === 'email' || step === 'email-sent') return 2;
        return 3;
    };

    return (
        <>
            <Navbar />
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 px-4 py-12">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-black tracking-tight mb-2">JOIN US.</h1>
                        <p className="text-gray-500">Create an account to start shopping</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between mb-8">
                        {steps.map((s, i) => (
                            <div key={s.key} className="flex items-center">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                                    ${getCurrentStepIndex() >= i
                                        ? 'bg-[#1e1e2d] text-white'
                                        : 'bg-gray-100 text-gray-400'
                                    }
                                `}>
                                    {getCurrentStepIndex() > i ? <Check className="w-5 h-5" /> : s.num}
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={`w-12 h-1 mx-1 rounded ${getCurrentStepIndex() > i ? 'bg-[#1e1e2d]' : 'bg-gray-100'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium mb-6">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Phone & Name */}
                    {step === 'phone' && (
                        <form onSubmit={handlePhoneSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase tracking-wider">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl outline-none transition-all"
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase tracking-wider">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl outline-none transition-all"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider">Mobile Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <span className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+91</span>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                        className="w-full pl-24 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl outline-none transition-all"
                                        placeholder="9876543210"
                                        pattern="[0-9]{10}"
                                        maxLength={10}
                                    />
                                </div>
                                <p className="text-xs text-gray-400">We'll send an OTP to verify your number</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || formData.phone.length !== 10}
                                className="w-full btn-primary py-5 flex items-center justify-center space-x-3 disabled:opacity-50"
                            >
                                <span className="text-lg font-bold">{loading ? 'Sending OTP...' : 'Continue'}</span>
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 'otp' && (
                        <form onSubmit={handleOTPSubmit} className="space-y-6">
                            <div className="text-center mb-4">
                                <p className="text-gray-600">
                                    Enter the 6-digit OTP sent to<br />
                                    <span className="font-bold text-[#1e1e2d]">+91 {formData.phone}</span>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <input
                                    type="text"
                                    required
                                    value={formData.otp}
                                    onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                    className="w-full px-4 py-6 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl outline-none transition-all text-center text-3xl tracking-[0.5em] font-bold"
                                    placeholder="000000"
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || formData.otp.length !== 6}
                                className="w-full btn-primary py-5 flex items-center justify-center space-x-3 disabled:opacity-50"
                            >
                                <span className="text-lg font-bold">{loading ? 'Verifying...' : 'Verify OTP'}</span>
                                <ArrowRight className="w-6 h-6" />
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={resendTimer > 0 || loading}
                                    className="text-gray-500 hover:text-[#1e1e2d] font-medium disabled:opacity-50 flex items-center justify-center mx-auto space-x-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    <span>
                                        {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: Email */}
                    {step === 'email' && (
                        <form onSubmit={handleEmailSubmit} className="space-y-6">
                            <div className="text-center mb-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8 text-green-600" />
                                </div>
                                <p className="text-gray-600">Phone verified! Now enter your email.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl outline-none transition-all"
                                        placeholder="name@example.com"
                                    />
                                </div>
                                <p className="text-xs text-gray-400">We'll send a verification link to your email</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !formData.email}
                                className="w-full btn-primary py-5 flex items-center justify-center space-x-3 disabled:opacity-50"
                            >
                                <span className="text-lg font-bold">{loading ? 'Sending...' : 'Send Verification Email'}</span>
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </form>
                    )}

                    {/* Step 3b: Email Sent */}
                    {step === 'email-sent' && (
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                <Mail className="w-10 h-10 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[#1e1e2d] mb-2">Check Your Email</h2>
                                <p className="text-gray-600">
                                    We've sent a verification link to<br />
                                    <span className="font-bold text-[#1e1e2d]">{formData.email}</span>
                                </p>
                            </div>
                            <p className="text-sm text-gray-400">
                                Click the link in the email to verify and set your password.
                            </p>

                            <button
                                type="button"
                                onClick={handleResendEmail}
                                disabled={resendTimer > 0 || loading}
                                className="text-gray-500 hover:text-[#1e1e2d] font-medium disabled:opacity-50 flex items-center justify-center mx-auto space-x-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>
                                    {resendTimer > 0 ? `Resend email in ${resendTimer}s` : 'Resend verification email'}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setStep('email');
                                    setError('');
                                }}
                                className="text-gray-400 hover:text-gray-600 text-sm"
                            >
                                Use a different email
                            </button>
                        </div>
                    )}

                    {/* Step 4: Set Password */}
                    {step === 'password' && (
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <div className="text-center mb-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8 text-green-600" />
                                </div>
                                <p className="text-gray-600">Email verified! Set your password to complete registration.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl outline-none transition-all"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl outline-none transition-all"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !formData.password || !formData.confirmPassword}
                                className="w-full btn-primary py-5 flex items-center justify-center space-x-3 disabled:opacity-50"
                            >
                                <span className="text-lg font-bold">{loading ? 'Creating Account...' : 'Complete Registration'}</span>
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </form>
                    )}

                    <div className="mt-10 text-center">
                        <p className="text-gray-500">
                            Already have an account?{' '}
                            <Link href="/login" className="text-black font-bold hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
            </div>
        }>
            <RegisterContent />
        </Suspense>
    );
}
