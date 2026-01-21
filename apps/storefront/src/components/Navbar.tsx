'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { ShoppingBag, User, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuthStore();
    const { totalItems, fetchCart } = useCartStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        }
    }, [isAuthenticated, fetchCart]);

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-black tracking-tighter">
                        BRAND.
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-8">
                        <Link href="/shop" className="text-sm font-medium hover:text-accent transition-colors">Shop</Link>
                        <Link href="/shop?category=men" className="text-sm font-medium hover:text-accent transition-colors">Men</Link>
                        <Link href="/shop?category=women" className="text-sm font-medium hover:text-accent transition-colors">Women</Link>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-5">
                        <Link href="/cart" className="relative p-2 hover:bg-gray-50 rounded-full transition-colors">
                            <ShoppingBag className="w-6 h-6" />
                            {totalItems > 0 && (
                                <span className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {totalItems}
                                </span>
                            )}
                        </Link>

                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <Link href="/profile" className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                                    <User className="w-6 h-6" />
                                </Link>
                                <button onClick={logout} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-red-500">
                                    <LogOut className="w-6 h-6" />
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="btn-primary py-2 px-6 text-sm">
                                Login
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-xl">
                    <Link href="/shop" className="block text-lg font-medium">Shop All</Link>
                    <Link href="/shop?category=men" className="block text-lg font-medium">Men</Link>
                    <Link href="/shop?category=women" className="block text-lg font-medium">Women</Link>
                    <hr />
                    {isAuthenticated ? (
                        <>
                            <Link href="/profile" className="block text-lg font-medium">My Profile</Link>
                            <button onClick={logout} className="block text-lg font-medium text-red-500">Logout</button>
                        </>
                    ) : (
                        <Link href="/login" className="block text-lg font-medium">Login / Register</Link>
                    )}
                </div>
            )}
        </nav>
    );
}
