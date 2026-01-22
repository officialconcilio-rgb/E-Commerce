'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import api from '@/utils/api';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CreditCard, Truck, ShieldCheck, X } from 'lucide-react';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface AddressFormData {
    type: 'Home' | 'Work' | 'Other';
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { items, totalAmount, clearCart } = useCartStore();
    const { user, isAuthenticated, checkAuth } = useAuthStore();
    const { settings, fetchSettings } = useSettingsStore();

    const [loading, setLoading] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addressLoading, setAddressLoading] = useState(false);
    const [addressForm, setAddressForm] = useState<AddressFormData>({
        type: 'Home',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
    });

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
        if (user?.addresses?.length > 0) {
            setSelectedAddress(user.addresses[0]._id);
        }
    }, [isAuthenticated, user, router]);

    useEffect(() => {
        fetchSettings();
    }, []);

    const subtotal = items.reduce((acc, item: any) => {
        const price = item.variantId.priceOverride || item.productId.basePrice;
        return acc + (price * item.quantity);
    }, 0);
    const shippingCost = subtotal > settings.freeShippingThreshold ? 0 : settings.shippingCost;
    const total = subtotal + shippingCost;

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.zipCode) {
            alert('Please fill in all required fields');
            return;
        }

        setAddressLoading(true);
        try {
            const res = await api.post('/auth/address', addressForm);

            if (res.data.success) {
                // Refresh user data to get updated addresses
                await checkAuth();

                // Select the newly added address (last one in the array)
                const addresses = res.data.addresses;
                if (addresses && addresses.length > 0) {
                    setSelectedAddress(addresses[addresses.length - 1]._id);
                }

                // Close modal and reset form
                setShowAddressModal(false);
                setAddressForm({
                    type: 'Home',
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: 'India'
                });
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to add address');
        } finally {
            setAddressLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!selectedAddress) {
            alert('Please select a shipping address');
            return;
        }

        setLoading(true);
        try {
            // 1. Create Order in Backend
            const orderRes = await api.post('/orders', {
                addressId: selectedAddress,
                paymentMethod: 'Prepaid'
            });

            const { order, razorpayOrder } = orderRes.data;

            // 2. Load Razorpay Script
            const isLoaded = await loadRazorpay();
            if (!isLoaded) {
                alert('Razorpay SDK failed to load. Are you online?');
                return;
            }

            // 3. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: 'BRAND.',
                description: `Order #${order.orderNumber}`,
                order_id: razorpayOrder.id,
                handler: async (response: any) => {
                    try {
                        // 4. Verify Payment in Backend
                        await api.post('/orders/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        clearCart();
                        router.push(`/order-success?id=${order._id}`);
                    } catch (error) {
                        alert('Payment verification failed');
                    }
                },
                modal: {
                    ondismiss: async function () {
                        // Handle payment cancellation
                        try {
                            await api.post('/orders/failed', {
                                razorpay_order_id: razorpayOrder.id,
                                error_description: 'Payment cancelled by user'
                            });
                        } catch (e) {
                            console.error('Failed to record cancellation');
                        }
                    }
                },
                prefill: {
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    contact: user.phone || ''
                },
                theme: {
                    color: '#000000'
                }
            };

            const paymentObject = new window.Razorpay(options);

            // Handle payment failure
            paymentObject.on('payment.failed', async function (response: any) {
                try {
                    await api.post('/orders/failed', {
                        razorpay_order_id: response.error.metadata.order_id,
                        error_description: response.error.description
                    });
                } catch (e) {
                    console.error('Failed to record payment failure');
                }
                alert('Oops! Something went wrong.\nPayment Failed');
            });

            paymentObject.open();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to initiate checkout');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-black tracking-tight mb-12">CHECKOUT.</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Left: Shipping & Payment */}
                    <div className="space-y-12">
                        <section>
                            <div className="flex items-center space-x-3 mb-6">
                                <Truck className="w-6 h-6" />
                                <h2 className="text-2xl font-bold">Shipping Address</h2>
                            </div>

                            <div className="space-y-4">
                                {user?.addresses?.map((addr: any) => (
                                    <label
                                        key={addr._id}
                                        className={`block p-6 border-2 rounded-2xl cursor-pointer transition-all ${selectedAddress === addr._id ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    checked={selectedAddress === addr._id}
                                                    onChange={() => setSelectedAddress(addr._id)}
                                                    className="w-5 h-5 accent-black"
                                                />
                                                <div>
                                                    <p className="font-bold">{addr.type}</p>
                                                    <p className="text-sm text-gray-500">{addr.street}, {addr.city}, {addr.state} - {addr.zipCode}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                                <button
                                    onClick={() => setShowAddressModal(true)}
                                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all"
                                >
                                    + Add New Address
                                </button>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center space-x-3 mb-6">
                                <CreditCard className="w-6 h-6" />
                                <h2 className="text-2xl font-bold">Payment Method</h2>
                            </div>
                            <div className="p-6 border-2 border-black bg-gray-50 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-black text-white p-2 rounded-lg">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold">Razorpay Secure</p>
                                        <p className="text-sm text-gray-500">UPI, Cards, Netbanking, Wallets</p>
                                    </div>
                                </div>
                                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="bg-gray-50 rounded-3xl p-10 h-fit">
                        <h2 className="text-2xl font-bold mb-8">Order Summary</h2>
                        <div className="space-y-6 mb-8">
                            {items.map((item: any) => (
                                <div key={item.variantId._id} className="flex justify-between items-center">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-white">
                                            <Image src={item.productId.images[0]} alt={item.productId.name} fill sizes="64px" className="object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{item.productId.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity} | Size: {item.variantId.size}</p>
                                        </div>
                                    </div>
                                    <span className="font-bold">₹{(item.variantId.priceOverride || item.productId.basePrice) * item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 pt-6 border-t border-gray-200">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{subtotal}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
                            </div>
                            <div className="flex justify-between text-2xl font-black pt-4">
                                <span>Total</span>
                                <span>₹{total}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={loading || items.length === 0}
                            className="w-full btn-primary py-5 mt-10 text-lg font-bold disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : `Pay ₹${total}`}
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Address Modal */}
            {showAddressModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black">Add New Address</h2>
                                <button
                                    onClick={() => setShowAddressModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleAddAddress} className="space-y-6">
                                {/* Address Type */}
                                <div>
                                    <label className="block text-sm font-bold uppercase tracking-wider mb-2">Address Type</label>
                                    <div className="flex gap-3">
                                        {(['Home', 'Work', 'Other'] as const).map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setAddressForm({ ...addressForm, type })}
                                                className={`px-6 py-3 rounded-xl font-bold transition-all ${addressForm.type === type
                                                    ? 'bg-black text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Street Address */}
                                <div>
                                    <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                                        Street Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={addressForm.street}
                                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                        placeholder="Enter your street address"
                                        className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-black focus:outline-none transition-all"
                                        required
                                    />
                                </div>

                                {/* City & State */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                                            City <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={addressForm.city}
                                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                            placeholder="City"
                                            className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-black focus:outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                                            State <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={addressForm.state}
                                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                            placeholder="State"
                                            className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-black focus:outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Zip Code & Country */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                                            ZIP Code <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={addressForm.zipCode}
                                            onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                                            placeholder="ZIP Code"
                                            className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-black focus:outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold uppercase tracking-wider mb-2">Country</label>
                                        <input
                                            type="text"
                                            value={addressForm.country}
                                            onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                            placeholder="Country"
                                            className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-black focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={addressLoading}
                                    className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50"
                                >
                                    {addressLoading ? 'Adding Address...' : 'Add Address'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
