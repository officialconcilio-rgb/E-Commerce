'use client';

import Navbar from '@/components/Navbar';
import { Truck, ShieldCheck, MapPin, Clock, Info } from 'lucide-react';

export default function ShippingPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="bg-gradient-to-br from-amber-600 to-orange-600 py-16 text-white">
                <div className="container-main text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4 font-heading">Shipping Information</h1>
                    <p className="text-amber-100 max-w-2xl mx-auto text-lg">
                        Fast, secure, and reliable delivery across India.
                    </p>
                </div>
            </div>

            <div className="container-main py-12 lg:py-20">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                                <Clock className="w-6 h-6 text-amber-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Delivery Timeline</h2>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                    Metros: 3-5 business days
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                    Other Cities: 5-7 business days
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                    Remote Areas: 7-10 business days
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                                <Truck className="w-6 h-6 text-amber-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Shipping Charges</h2>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                    Free shipping on orders above ₹1999
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                    Flat ₹99 for orders below ₹1999
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                    COD available for select locations
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-white p-8 lg:p-12 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <Info className="w-6 h-6 text-amber-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Our Shipping Partners</h2>
                        </div>
                        <p className="text-gray-600 mb-8 max-w-2xl">
                            We partner with the most reliable courier services in India to ensure your gifts reach you or your loved ones in perfect condition.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 opacity-60">
                            <div className="h-12 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-400">Delhivery</div>
                            <div className="h-12 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-400">BlueDart</div>
                            <div className="h-12 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-400">XpressBees</div>
                            <div className="h-12 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-400">Ecom Express</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
