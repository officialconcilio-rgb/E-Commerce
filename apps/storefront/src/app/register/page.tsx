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
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-8">
                <Link href="/" className="inline-block">
                    <span className="text-6xl font-allura bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">Vagmi</span>
                </Link>
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-gray-900 font-heading">Join Vagmi</h1>
                    <p className="text-gray-500">We've simplified our login. No more passwords or phone OTPs required.</p>
                </div>

                <div className="bg-purple-50 p-8 rounded-3xl border border-purple-100">
                    <p className="text-purple-800 font-medium mb-6">
                        Use our new streamlined login to create your account or sign in.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
                    >
                        Go to Login / Sign Up
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                <p className="text-sm text-gray-400">
                    Entering your email on the login page will automatically create an account if you don't have one.
                </p>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={null}>
            <RegisterContent />
        </Suspense>
    );
}
