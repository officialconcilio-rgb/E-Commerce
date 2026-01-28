'use client';

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 py-12 lg:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-2 md:col-span-1 border-r border-gray-800 pr-8">
                        <Link href="/" className="inline-block group">
                            <span className="relative inline-block">
                                <h4
                                    className="text-5xl font-allura tracking-wide italic leading-none mb-6"
                                    style={{
                                        fontFamily: 'var(--font-allura), cursive',
                                        background: 'linear-gradient(135deg, #a855f7 0%, #c084fc 25%, #e879f9 50%, #f0abfc 75%, #fbbf24 100%)',
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        color: 'transparent',
                                        filter: 'drop-shadow(0 2px 8px rgba(168, 85, 247, 0.4))',
                                    }}
                                >
                                    Vagmi
                                </h4>
                                <span
                                    className="absolute -top-1 -right-2 text-amber-400 animate-pulse"
                                    style={{ fontSize: '10px' }}
                                >
                                    ✦
                                </span>
                            </span>
                        </Link>
                        <p className="text-sm mb-4 leading-relaxed text-gray-400">
                            Your trusted destination for quality gift items rooted in tradition and timeless values. Each piece is chosen with care to make every occasion memorable and meaningful.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4 uppercase text-sm">Shop</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4 uppercase text-sm">Help</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                            <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                            <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Info</Link></li>
                            <li><Link href="/returns" className="hover:text-white transition-colors">Returns</Link></li>
                            <li><Link href="/bulk-orders" className="hover:text-white transition-colors">Bulk Orders</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4 uppercase text-sm">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
                        <p>© 2026 Vagmi Enterprises. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            <span>Secure Payments</span>
                            <span>•</span>
                            <span>Made in India 🇮🇳</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
