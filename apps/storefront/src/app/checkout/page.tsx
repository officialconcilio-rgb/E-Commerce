'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import api from '@/utils/api';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CreditCard, Truck, ShieldCheck, X, ChevronRight, MapPin, Lock, Info } from 'lucide-react';

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
        const price = item.variantId?.priceOverride || item.productId?.price || 0;
        return acc + (price * item.quantity);
    }, 0);
    const shippingCost = subtotal > (settings?.freeShippingThreshold || 999) ? 0 : (settings?.shippingCost || 99);
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
                await checkAuth();
                const addresses = res.data.addresses;
                if (addresses && addresses.length > 0) {
                    setSelectedAddress(addresses[addresses.length - 1]._id);
                }
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
            const orderRes = await api.post('/orders', {
                addressId: selectedAddress,
                paymentMethod: 'Prepaid'
            });

            const { order, razorpayOrder } = orderRes.data;
            const isLoaded = await loadRazorpay();

            if (!isLoaded) {
                alert('Razorpay SDK failed to load. Are you online?');
                return;
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: 'VAGMI',
                description: `Order #${order.orderNumber}`,
                order_id: razorpayOrder.id,
                handler: async (response: any) => {
                    try {
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
                    color: '#d97706'
                }
            };

            const paymentObject = new window.Razorpay(options);
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

    if (items.length === 0 && !loading) {
        return (
            <div className="min-h-screen bg-gray-50 text-center flex flex-col items-center justify-center p-4">
                <Navbar />
                <div className="bg-white rounded-[40px] p-12 shadow-sm max-w-lg w-full">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="w-10 h-10 text-amber-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Your bag is empty</h1>
                    <p className="text-gray-500 mb-10">Add some gifts to your bag before checking out.</p>
                    <Link href="/shop" className="btn-primary w-full py-4 px-10 rounded-full">Explore Gifts</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="container-main py-3">
                    <nav className="text-sm text-gray-500 flex items-center">
                        <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <Link href="/cart" className="hover:text-amber-600 transition-colors">Bag</Link>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <span className="text-gray-800">Checkout</span>
                    </nav>
                </div>
            </div>

            <div className="container-main py-8">
                <div className="flex flex-col lg:flex-row gap-8 xl:gap-16">
                    {/* Left: Main Column */}
                    <div className="lg:w-3/5 space-y-8">
                        {/* Header */}
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Checkout</h1>
                            <p className="text-gray-500">Please provide your delivery and payment details</p>
                        </div>

                        {/* Step 1: Shipping Address */}
                        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                            <div className="p-6 lg:p-8 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 text-sm">1</div>
                                    Shipping Address
                                </h2>
                                <button
                                    onClick={() => setShowAddressModal(true)}
                                    className="text-amber-600 font-bold text-sm hover:underline"
                                >
                                    + Add New
                                </button>
                            </div>
                            <div className="p-6 lg:p-8 space-y-4">
                                {user?.addresses?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {user.addresses.map((addr: any) => (
                                            <label
                                                key={addr._id}
                                                className={`relative p-5 border-2 rounded-2xl cursor-pointer transition-all ${selectedAddress === addr._id
                                                    ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                                                    : 'border-gray-100 hover:border-amber-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    checked={selectedAddress === addr._id}
                                                    onChange={() => setSelectedAddress(addr._id)}
                                                    className="sr-only"
                                                />
                                                <div className="flex items-start justify-between mb-3">
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${selectedAddress === addr._id ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-500'
                                                        }`}>
                                                        {addr.type}
                                                    </span>
                                                    {selectedAddress === addr._id && (
                                                        <ShieldCheck className="w-5 h-5 text-amber-600" />
                                                    )}
                                                </div>
                                                <p className="font-bold text-gray-800 text-sm mb-1">{user.firstName} {user.lastName}</p>
                                                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                                                    {addr.street}, {addr.city}<br />
                                                    {addr.state} - {addr.zipCode}
                                                </p>
                                                <p className="text-[11px] text-gray-400 font-medium">+91 {user.phone || '98765 43210'}</p>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                                        <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 mb-6">No saved addresses found</p>
                                        <button
                                            onClick={() => setShowAddressModal(true)}
                                            className="btn-primary py-3 px-8 rounded-full"
                                        >
                                            Add Shipping Address
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Step 2: Payment Method */}
                        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                            <div className="p-6 lg:p-8 bg-gray-50/50 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 text-sm">2</div>
                                    Payment Method
                                </h2>
                            </div>
                            <div className="p-6 lg:p-8">
                                <div className="p-6 border-2 border-amber-500 bg-amber-50/50 rounded-2xl flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                            <CreditCard className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">Razorpay Secure Checkout</p>
                                            <p className="text-xs text-gray-500 font-medium">UPI, Cards, Wallets, and Netbanking</p>
                                        </div>
                                    </div>
                                    <div className="w-6 h-6 border-2 border-amber-600 rounded-full flex items-center justify-center">
                                        <div className="w-3 h-3 bg-amber-600 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center gap-3 text-xs text-gray-400 bg-gray-50 p-4 rounded-xl">
                                    <Lock className="w-4 h-4 text-green-500" />
                                    <span>Bank-grade 256-bit SSL encryption. Your payment details are never stored.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Sidebar */}
                    <div className="lg:w-2/5">
                        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden sticky top-28">
                            <div className="p-8">
                                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                                    Order Summary
                                    <span className="text-sm font-normal text-gray-400">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                                </h3>

                                {/* Items List */}
                                <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {items.map((item: any) => (
                                        <div key={item.variantId?._id} className="flex gap-4 p-2 rounded-2xl hover:bg-gray-50 transition-colors">
                                            <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                                <Image
                                                    src={item.productId?.images?.[0]}
                                                    alt={item.productId?.name}
                                                    fill
                                                    sizes="64px"
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <p className="font-bold text-gray-800 text-sm truncate">{item.productId?.name}</p>
                                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">
                                                    Qty: {item.quantity} • Size: {item.variantId?.size || 'N/A'}
                                                </p>
                                                <p className="font-bold text-amber-600 text-sm italic">
                                                    ₹{(item.variantId?.priceOverride || item.productId?.price || 0) * item.quantity}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 pt-6 border-t border-gray-100 mb-8">
                                    <div className="flex justify-between text-sm text-gray-500 font-medium">
                                        <span>Items Total</span>
                                        <span className="text-gray-800">₹{subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500 font-medium">
                                        <span className="flex items-center gap-1.5">
                                            Delivery
                                            <Info className="w-3.5 h-3.5 text-gray-300" />
                                        </span>
                                        <span className={shippingCost === 0 ? 'text-green-600 font-bold' : 'text-gray-800'}>
                                            {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                                        </span>
                                    </div>
                                    <div className="pt-4 flex justify-between items-end">
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Amount</p>
                                            <p className="font-black text-3xl text-gray-900 tracking-tight">₹{total}</p>
                                        </div>
                                        <p className="text-[10px] text-green-600 font-bold mb-1">SAVING ₹99 SHIPPING</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={loading || !selectedAddress}
                                    className="w-full btn-primary py-5 rounded-full text-lg font-bold shadow-xl shadow-amber-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
                                >
                                    {loading ? 'Processing...' : (
                                        <>
                                            Place Order
                                            <ChevronRight className="w-6 h-6" />
                                        </>
                                    )}
                                </button>

                                <p className="text-[10px] text-center text-gray-400 mt-6 font-medium">
                                    By placing the order, you agree to Vagmi's <Link href="/terms" className="underline">Terms & Conditions</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Address Modal */}
            {showAddressModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-gray-800">New Address</h2>
                                <button
                                    onClick={() => setShowAddressModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleAddAddress} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Location Type</label>
                                    <div className="flex gap-3">
                                        {(['Home', 'Work', 'Other'] as const).map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setAddressForm({ ...addressForm, type })}
                                                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all border-2 ${addressForm.type === type
                                                    ? 'border-amber-600 bg-amber-600 text-white shadow-lg shadow-amber-100'
                                                    : 'border-gray-100 text-gray-500 hover:border-amber-200'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Full Address</label>
                                    <input
                                        type="text"
                                        required
                                        value={addressForm.street}
                                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                        placeholder="Flat/House No., Street name"
                                        className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-xl outline-none transition-all text-sm font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">City</label>
                                        <input
                                            type="text"
                                            required
                                            value={addressForm.city}
                                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-xl outline-none transition-all text-sm font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">State</label>
                                        <input
                                            type="text"
                                            required
                                            value={addressForm.state}
                                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-xl outline-none transition-all text-sm font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pincode</label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            value={addressForm.zipCode}
                                            onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value.replace(/\D/g, '') })}
                                            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-xl outline-none transition-all text-sm font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Country</label>
                                        <input
                                            type="text"
                                            disabled
                                            value={addressForm.country}
                                            className="w-full p-4 bg-gray-100 border-2 border-transparent rounded-xl text-gray-400 text-sm font-medium cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={addressLoading}
                                    className="w-full btn-primary py-4 rounded-full font-bold shadow-lg shadow-amber-200 mt-4 h-14"
                                >
                                    {addressLoading ? 'Saving...' : 'Save & Use Address'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
