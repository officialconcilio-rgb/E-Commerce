'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import Navbar from '@/components/Navbar';
import { Mail, Check, X, Loader2 } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [tempToken, setTempToken] = useState('');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link');
            return;
        }

        verifyEmail();
    }, [token]);

    const verifyEmail = async () => {
        try {
            const res = await api.get(`/auth/register/verify-email/${token}`);
            setStatus('success');
            setMessage(res.data.message);
            setTempToken(res.data.tempToken);
            setUserName(res.data.user?.firstName || '');
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Verification failed');
        }
    };

    const handleContinue = () => {
        router.push(`/register?verified=true&tempToken=${tempToken}`);
    };

    return (
        <>
            <Navbar />
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 px-4 py-12">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center">
                    {status === 'loading' && (
                        <>
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
                            </div>
                            <h1 className="text-2xl font-black text-[#1e1e2d] mb-2">Verifying Email...</h1>
                            <p className="text-gray-500">Please wait while we verify your email address.</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-10 h-10 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-black text-[#1e1e2d] mb-2">Email Verified!</h1>
                            <p className="text-gray-500 mb-8">
                                {userName ? `Welcome, ${userName}! ` : ''}
                                Your email has been verified successfully. Click below to set your password and complete your registration.
                            </p>
                            <button
                                onClick={handleContinue}
                                className="w-full btn-primary py-5 flex items-center justify-center space-x-3"
                            >
                                <span className="text-lg font-bold">Set Password & Complete</span>
                            </button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <X className="w-10 h-10 text-red-600" />
                            </div>
                            <h1 className="text-2xl font-black text-[#1e1e2d] mb-2">Verification Failed</h1>
                            <p className="text-gray-500 mb-8">{message}</p>
                            <Link
                                href="/register"
                                className="block w-full btn-primary py-5 text-center font-bold"
                            >
                                Try Again
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1e1e2d] border-t-transparent"></div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
