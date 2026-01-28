'use client';

import { useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, CheckCircle, Gift, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Breadcrumb */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="container-main py-3">
                    <nav className="flex items-center text-sm text-gray-500">
                        <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <span className="text-gray-800">Contact Us</span>
                    </nav>
                </div>
            </div>

            {/* Hero */}
            <section className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 py-12 lg:py-20">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-amber-300 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-rose-300 rounded-full blur-3xl"></div>
                </div>
                <div className="container-main relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-amber-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
                        <Gift className="w-4 h-4" />
                        We're Here to Help
                    </div>
                    <h1 className="text-3xl lg:text-5xl font-bold text-gray-800 mb-4">Get in Touch</h1>
                    <p className="text-gray-600 max-w-xl mx-auto text-lg">
                        Have a question about our products, bulk orders, or need assistance? We'd love to hear from you.
                    </p>
                </div>
            </section>

            {/* Contact Cards */}
            <section className="py-8 lg:py-12 bg-white">
                <div className="container-main">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl text-center hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-warm">
                                <Phone className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-2">Call Us</h3>
                            <p className="text-gray-600 text-sm">+91 98765 43210</p>
                            <p className="text-gray-400 text-xs mt-1">Mon-Sat, 9am-6pm</p>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl text-center hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-warm">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-2">Email Us</h3>
                            <p className="text-gray-600 text-sm">hello@vagmi.com</p>
                            <p className="text-gray-400 text-xs mt-1">We reply within 24 hours</p>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl text-center hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-warm">
                                <MessageCircle className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-2">WhatsApp</h3>
                            <p className="text-gray-600 text-sm">+91 98765 43210</p>
                            <p className="text-gray-400 text-xs mt-1">Quick responses</p>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl text-center hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-warm">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-2">Visit Us</h3>
                            <p className="text-gray-600 text-sm">Mumbai, India</p>
                            <p className="text-gray-400 text-xs mt-1">By appointment</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section className="py-12 lg:py-20">
                <div className="container-main">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
                        {/* Left - Info */}
                        <div>
                            <span className="inline-block text-amber-600 font-semibold uppercase tracking-wide text-sm mb-3">Contact Us</span>
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">
                                We're Here to Help
                            </h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Whether you have a question about products, shipping, returns, bulk orders, or anything else,
                                our team is ready to answer all your questions. Fill out the form and we'll get
                                back to you as soon as possible.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                                        <Clock className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-1">Quick Response</h4>
                                        <p className="text-gray-500 text-sm">We usually respond within 24 hours</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-1">Expert Support</h4>
                                        <p className="text-gray-500 text-sm">Our team of experts are here to help you</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                                        <Gift className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-1">Bulk Orders</h4>
                                        <p className="text-gray-500 text-sm">Special pricing for corporate & bulk orders</p>
                                    </div>
                                </div>
                            </div>

                            {/* Image */}
                            <div className="mt-10 relative aspect-[16/9] rounded-2xl overflow-hidden hidden lg:block shadow-lg">
                                <Image
                                    src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920&q=90&fit=crop"
                                    alt="Gift Collection"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>

                        {/* Right - Form */}
                        <div className="bg-gradient-to-br from-gray-50 to-amber-50/30 p-6 lg:p-10 rounded-2xl">
                            {submitted ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                        <CheckCircle className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Message Sent!</h3>
                                    <p className="text-gray-500 mb-6">Thank you for reaching out. We'll get back to you soon.</p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="btn-secondary"
                                    >
                                        Send Another Message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <h3 className="text-xl font-bold text-gray-800 mb-6">Send us a Message</h3>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                            <input type="text" required className="input-field" placeholder="John" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                            <input type="text" required className="input-field" placeholder="Doe" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                        <input type="email" required className="input-field" placeholder="john@example.com" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                        <input type="tel" className="input-field" placeholder="+91 98765 43210" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                        <select className="input-field">
                                            <option value="">Select a topic</option>
                                            <option value="order">Order Inquiry</option>
                                            <option value="product">Product Question</option>
                                            <option value="bulk">Bulk/Corporate Orders</option>
                                            <option value="return">Returns & Refunds</option>
                                            <option value="feedback">Feedback</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                        <textarea
                                            required
                                            rows={4}
                                            className="input-field resize-none"
                                            placeholder="Tell us how we can help you..."
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary w-full py-4 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Teaser */}
            <section className="py-12 lg:py-16 bg-gray-50">
                <div className="container-main text-center">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-gray-500 mb-8 max-w-xl mx-auto">
                        Find quick answers to common questions about orders, shipping, returns, and more.
                    </p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-4xl mx-auto">
                        {[
                            { q: 'How do I track my order?', a: 'You can track your order in your profile under "My Orders".' },
                            { q: 'What is the return policy?', a: 'We offer easy 7-day returns on most products.' },
                            { q: 'Do you offer bulk pricing?', a: 'Yes! Contact us for special corporate and bulk order rates.' },
                        ].map((faq) => (
                            <div key={faq.q} className="bg-white p-6 rounded-xl text-left shadow-sm hover:shadow-md transition-shadow">
                                <h4 className="font-semibold text-gray-800 mb-2">{faq.q}</h4>
                                <p className="text-sm text-gray-500">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}
