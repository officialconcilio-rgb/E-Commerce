'use client';

import Navbar from '@/components/Navbar';
import { HelpCircle, ChevronRight, Truck, RotateCcw, CreditCard, User } from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
    const faqs = [
        {
            category: 'Orders',
            icon: <HelpCircle className="w-5 h-5 text-amber-600" />,
            items: [
                { q: 'How do I place an order?', a: 'Browse our collection, add items to your cart, and proceed to checkout. You will need to create an account to finalize the order.' },
                { q: 'Can I change my order after placing it?', a: 'Orders can only be modified within 2 hours of placement. Please contact our support team immediately for assistance.' },
            ]
        },
        {
            category: 'Shipping',
            icon: <Truck className="w-5 h-5 text-amber-600" />,
            items: [
                { q: 'How long does delivery take?', a: 'Standard delivery usually takes 5-7 business days across India. Express options are available in select cities.' },
                { q: 'Do you ship internationally?', a: 'Currently, we only ship within India. We plan to expand internationally soon.' },
            ]
        },
        {
            category: 'Returns',
            icon: <RotateCcw className="w-5 h-5 text-amber-600" />,
            items: [
                { q: 'What is your return policy?', a: 'We offer a 7-day return policy for most items. The product must be in its original packaging and unused.' },
                { q: 'How do I initiate a return?', a: 'You can initiate a return from your profile section under "My Orders".' },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="bg-gradient-to-br from-amber-600 to-orange-600 py-16 text-white">
                <div className="container-main text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4 font-heading">Frequently Asked Questions</h1>
                    <p className="text-amber-100 max-w-2xl mx-auto text-lg">
                        Find quick answers to common questions about our products and services.
                    </p>
                </div>
            </div>

            <div className="container-main py-12 lg:py-20">
                <div className="max-w-4xl mx-auto space-y-12">
                    {faqs.map((group) => (
                        <div key={group.category}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-amber-100 rounded-lg">{group.icon}</div>
                                <h2 className="text-2xl font-bold text-gray-800">{group.category}</h2>
                            </div>
                            <div className="grid gap-4">
                                {group.items.map((item, i) => (
                                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                        <h3 className="font-bold text-gray-800 mb-2">{item.q}</h3>
                                        <p className="text-gray-600 leading-relaxed">{item.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 bg-amber-50 rounded-3xl p-8 lg:p-12 text-center border border-amber-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Still have questions?</h2>
                    <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                        If you couldn't find the answer you were looking for, please feel free to reach out to our support team.
                    </p>
                    <Link href="/contact" className="btn-primary">
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
}
