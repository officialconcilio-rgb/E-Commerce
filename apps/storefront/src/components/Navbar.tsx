'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { ShoppingBag, User, Search, Menu, X, Heart, ChevronDown } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/utils/api';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuthStore();
    const { items, fetchCart } = useCartStore();
    const { items: wishlistItems, fetchWishlist } = useWishlistStore();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const router = useRouter();


    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist();
            fetchCart();
        }
    }, [isAuthenticated, fetchWishlist, fetchCart]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/products/categories');
                // Only take top 5 active categories for the header
                setCategories(res.data.categories.filter((c: any) => c.isActive).slice(0, 5));
            } catch (error) {
                console.error('Failed to fetch categories');
            }
        };
        fetchCategories();
    }, []);

    const categoryDocs = categories.map(c => ({
        name: c.name,
        href: `/shop?category=${c.slug}`
    }));

    return (
        <>
            {/* Main Navbar */}
            <nav className={`sticky top-0 z-50 bg-white transition-all duration-300 ${scrolled ? 'shadow-md' : 'border-b border-gray-100'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        {/* Left: Mobile Menu + Logo */}
                        <div className="flex items-center gap-4">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900"
                            >
                                <Menu className="w-6 h-6" />
                            </button>

                            {/* Logo */}
                            <Link href="/" className="flex items-center group">
                                <span className="relative">
                                    {/* Decorative glow effect */}
                                    <span
                                        className="absolute inset-0 blur-lg opacity-40 group-hover:opacity-60 transition-opacity"
                                        style={{
                                            background: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 50%, #f59e0b 100%)',
                                            WebkitBackgroundClip: 'text',
                                            backgroundClip: 'text',
                                        }}
                                        aria-hidden="true"
                                    >
                                        Vagmi
                                    </span>
                                    {/* Main text with gradient */}
                                    <span
                                        className="relative text-4xl lg:text-5xl font-allura tracking-wide italic leading-none"
                                        style={{
                                            fontFamily: 'var(--font-allura), cursive',
                                            background: 'linear-gradient(135deg, #581c87 0%, #7c3aed 25%, #a855f7 50%, #c026d3 75%, #d97706 100%)',
                                            WebkitBackgroundClip: 'text',
                                            backgroundClip: 'text',
                                            color: 'transparent',
                                            textShadow: 'none',
                                            filter: 'drop-shadow(0 2px 4px rgba(124, 58, 237, 0.3))',
                                        }}
                                    >
                                        Vagmi
                                    </span>
                                    {/* Decorative sparkle */}
                                    <span
                                        className="absolute -top-1 -right-2 text-amber-400 text-xs animate-pulse"
                                        style={{ fontSize: '10px' }}
                                    >
                                        ✦
                                    </span>
                                </span>
                            </Link>
                        </div>

                        {/* Center: Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-8">
                            {categoryDocs.map((category) => (
                                <Link
                                    key={category.name}
                                    href={category.href}
                                    className={`text-sm font-medium tracking-wide transition-colors relative group ${pathname?.includes(category.href.split('?')[0])
                                        ? 'text-amber-600'
                                        : 'text-gray-600 hover:text-amber-600'
                                        }`}
                                >
                                    {category.name}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 group-hover:w-full transition-all duration-300"></span>
                                </Link>
                            ))}
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-1 sm:gap-3">
                            {/* Search */}
                            <button
                                onClick={() => setSearchOpen(!searchOpen)}
                                className="p-2 text-gray-600 hover:text-amber-600 transition-colors"
                            >
                                <Search className="w-5 h-5" />
                            </button>

                            {/* Wishlist */}
                            <Link
                                href="/wishlist"
                                className="hidden sm:flex p-2 text-gray-600 hover:text-amber-600 transition-colors relative group"
                            >
                                <Heart className="w-5 h-5" />
                                {wishlistItems.length > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                                        {wishlistItems.length}
                                    </span>
                                )}
                            </Link>

                            {/* Profile */}
                            {isAuthenticated ? (
                                <Link
                                    href="/profile"
                                    className="p-2 flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors group"
                                >
                                    <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover:scale-110 transition-transform">
                                        {user?.firstName?.[0] || 'U'}
                                    </div>
                                    <span className="hidden xl:inline text-sm font-semibold">
                                        {user?.firstName ? `Hi, ${user.firstName}` : 'My Account'}
                                    </span>
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="p-2 flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors group"
                                >
                                    <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span className="hidden xl:inline text-sm font-semibold">Login</span>
                                </Link>
                            )}

                            {/* Cart */}
                            <Link
                                href="/cart"
                                className="p-2 text-gray-600 hover:text-amber-600 transition-colors relative group"
                            >
                                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                {items.length > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-amber-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                                        {items.length}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Search Bar - Expandable */}
                {searchOpen && (
                    <div className="border-t border-gray-100 py-4 px-4 bg-white animate-fade-in">
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && searchQuery.trim()) {
                                            router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                                            setSearchOpen(false);
                                            setSearchQuery('');
                                        }
                                    }}
                                    placeholder="Search for gifts, idols, decor..."
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    autoFocus
                                />
                                <button
                                    onClick={() => setSearchOpen(false)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setMobileMenuOpen(false)}
                    ></div>
                    <div className="absolute left-0 top-0 bottom-0 w-[80%] max-w-xs bg-white shadow-xl overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <span className="relative">
                                <span
                                    className="text-4xl font-allura tracking-wide italic leading-none"
                                    style={{
                                        fontFamily: 'var(--font-allura), cursive',
                                        background: 'linear-gradient(135deg, #581c87 0%, #7c3aed 25%, #a855f7 50%, #c026d3 75%, #d97706 100%)',
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        color: 'transparent',
                                        filter: 'drop-shadow(0 2px 4px rgba(124, 58, 237, 0.3))',
                                    }}
                                >
                                    Vagmi
                                </span>
                                <span
                                    className="absolute -top-1 -right-2 text-amber-400 animate-pulse"
                                    style={{ fontSize: '8px' }}
                                >
                                    ✦
                                </span>
                            </span>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* User Section */}
                        <div className="p-4 border-b border-gray-100 bg-amber-50">
                            {isAuthenticated ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-sm text-gray-500">{user?.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">Login / Sign Up</p>
                                        <p className="text-sm text-gray-500">Access your account</p>
                                    </div>
                                </Link>
                            )}
                        </div>

                        {/* Categories */}
                        <div className="p-4">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Shop Categories</h3>
                            <nav className="space-y-1">
                                {categoryDocs.map((category) => (
                                    <Link
                                        key={category.name}
                                        href={category.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                                    >
                                        <span className="font-medium">{category.name}</span>
                                        <ChevronDown className="w-4 h-4 -rotate-90" />
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Quick Links */}
                        <div className="p-4 border-t border-gray-100">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Links</h3>
                            <nav className="space-y-1">
                                <MobileNavLink href="/profile" onClick={() => setMobileMenuOpen(false)}>My Account</MobileNavLink>
                                <MobileNavLink href="/profile" onClick={() => setMobileMenuOpen(false)}>My Orders</MobileNavLink>
                                <MobileNavLink href="/wishlist" onClick={() => setMobileMenuOpen(false)}>Wishlist</MobileNavLink>
                                <MobileNavLink href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact Us</MobileNavLink>
                                <MobileNavLink href="/about" onClick={() => setMobileMenuOpen(false)}>About Vagmi</MobileNavLink>
                            </nav>
                        </div>

                        {/* Logout */}
                        {isAuthenticated && (
                            <div className="p-4 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        logout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full py-3 text-red-600 font-medium text-center hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
        >
            <span>{children}</span>
            <ChevronDown className="w-4 h-4 -rotate-90" />
        </Link>
    );
}
