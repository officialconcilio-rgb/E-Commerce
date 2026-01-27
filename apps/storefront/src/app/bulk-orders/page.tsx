'use client';

import Navbar from '@/components/Navbar';
import { Gift, Users, CreditCard, Ship, MessageSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BulkOrdersPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="bg-gradient-to-br from-amber-600 to-orange-600 py-16 lg:py-24 text-white">
                <div className="container-main text-center">
                    <h1 className="text-4xl lg:text-6xl font-bold mb-6 font-heading">Corporate & Bulk Gifting</h1>
                    <p className="text-amber-100 max-w-2xl mx-auto text-lg lg:text-xl">
                        Elevate your corporate gifting with our premium, culturally-inspired collections.
                    </p>
                </div>
            </div>

            <div className="container-main py-12 lg:py-20">
                <div className="grid lg:grid-cols-3 gap-8 mb-20">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-600">
                            <Gift className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Custom Hamper Sets</h3>
                        <p className="text-gray-500 text-sm">Tailor-made gift boxes designed according to your brand and occasion.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-600">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">bulk Discounting</h3>
                        <p className="text-gray-500 text-sm">Attractive pricing for orders ranging from 50 to 5,000+ units.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-600">
                            <CreditCard className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">GST Invoicing</h3>
                        <p className="text-gray-500 text-sm">Official GST tax invoices provided for all corporate purchases.</p>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] p-8 lg:p-16 shadow-xl border border-gray-100">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">Partner with Vagmi</h2>
                            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                                Join dozens of leading companies that trust Vagmi for their festive, welcome, and celebratory gifting needs. We offer:
                            </p>
                            <ul className="space-y-4 mb-10">
                                {[
                                    'Logo branding on select items',
                                    'Pan-India doorstep delivery for remote employees',
                                    'Dedicated account manager',
                                    'High-quality premium materials'
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-gray-700">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/contact?subject=bulk" className="btn-primary">
                                Get a Quote <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </div>
                        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1512418490979-92798cccbe3a?w=1000&q=90&fit=crop"
                                alt="Corporate Gifts"
                                className="object-cover w-full h-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
