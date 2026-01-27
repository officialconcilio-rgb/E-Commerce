'use client';

import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { Heart, ShoppingBag, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useWishlistStore } from '@/store/useWishlistStore';

export default function WishlistPage() {
    const { items: wishlist, loading, fetchWishlist } = useWishlistStore();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist();
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="container-main py-20 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-10 h-10 text-amber-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h1>
                        <p className="text-gray-500 mb-8">Login to your account to view and manage your wishlist.</p>
                        <Link href="/login?redirect=/wishlist" className="btn-primary inline-flex items-center gap-2">
                            Login Now <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (loading && wishlist.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container-main py-12">
                    <div className="animate-pulse space-y-8">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="aspect-[3/4] bg-gray-200 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container-main py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                            <Heart className="w-6 h-6 text-amber-600 fill-amber-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
                            <p className="text-sm text-gray-500 font-medium">{wishlist.length} saved products</p>
                        </div>
                    </div>
                    {wishlist.length > 0 && (
                        <Link href="/shop" className="text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-2">
                            Add more products <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>

                {wishlist.length === 0 ? (
                    <div className="bg-white rounded-[40px] p-16 text-center shadow-sm border border-gray-100">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-12 h-12 text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-10 max-w-xs mx-auto">Looks like you haven't saved anything yet. Start exploring our premium collection.</p>
                        <Link href="/shop" className="btn-primary py-4 px-10 rounded-full">
                            Explore Collection
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
                        {wishlist.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
