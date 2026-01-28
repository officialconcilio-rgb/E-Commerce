'use client';

import Navbar from '@/components/Navbar';
import { RotateCcw, ShieldCheck, AlertCircle, CheckCircle, Package } from 'lucide-react';
import Link from 'next/link';

export default function ReturnsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="bg-gradient-to-br from-amber-600 to-orange-600 py-16 text-white">
                <div className="container-main text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4 font-heading">Returns & Refunds</h1>
                    <p className="text-amber-100 max-w-2xl mx-auto text-lg">
                        Easy 7-day return policy for your peace of mind.
                    </p>
                </div>
            </div>

            <div className="container-main py-12 lg:py-20">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="bg-white p-8 lg:p-12 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8">Return Policy</h2>
                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 mb-1">Eligible Items</h4>
                                        <p className="text-sm text-gray-600">Unused items in original packaging with tags intact.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                                        <RotateCcw className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 mb-1">Return Window</h4>
                                        <p className="text-sm text-gray-600">Request a return within 7 days of delivery.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                        <ShieldCheck className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 mb-1">Quality Check</h4>
                                        <p className="text-sm text-gray-600">Items are inspected before processing refunds.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-amber-500" />
                                    Non-Returnable Items
                                </h4>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li>• Personalized or custom-made items</li>
                                    <li>• Items on clearance or final sale</li>
                                    <li>• Fragile items damaged by the user</li>
                                    <li>• Used pooja essentials (Diyas, Incense)</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 lg:p-12 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8">How to Return?</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { step: 1, title: 'Request Return', desc: 'Go to "My Orders" in your profile and select the items to return.' },
                                { step: 2, title: 'Packing', desc: 'Pack the items securely in their original box with all accessories.' },
                                { step: 3, title: 'Pickup', desc: 'Our courier partner will pick up the package within 48 hours.' },
                            ].map((s) => (
                                <div key={s.step} className="text-center">
                                    <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                                        {s.step}
                                    </div>
                                    <h4 className="font-bold text-gray-800 mb-2">{s.title}</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-gray-500 mb-6">Need help with a return or refund?</p>
                        <Link href="/contact" className="btn-secondary">
                            Talk to Support
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
