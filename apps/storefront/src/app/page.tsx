'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import api from '@/utils/api';
import { ArrowRight, ShoppingBag, Star, ShieldCheck, Truck } from 'lucide-react';

export default function Home() {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const res = await api.get('/products?limit=4');
                setFeaturedProducts(res.data.products);
            } catch (error) {
                console.error('Failed to fetch featured products');
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    return (
        <>
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center overflow-hidden bg-black">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop"
                        alt="Hero Background"
                        fill
                        sizes="100vw"
                        priority
                        className="object-cover opacity-60 scale-105 animate-slow-zoom"
                    />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                    <div className="max-w-3xl">
                        <h1 className="text-7xl md:text-8xl font-black text-white tracking-tighter leading-none mb-8">
                            REDEFINE <br /> <span className="text-accent-foreground">MODERN.</span>
                        </h1>
                        <p className="text-xl text-gray-300 mb-10 max-w-xl leading-relaxed">
                            Experience the pinnacle of premium fashion. Our new collection combines timeless elegance with contemporary design.
                        </p>
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                            <Link href="/shop" className="btn-primary bg-white text-black hover:bg-gray-100 py-5 px-10 text-lg">
                                Shop Collection
                            </Link>
                            <Link href="/shop?category=men" className="btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-black py-5 px-10 text-lg">
                                Explore Men
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="flex items-start space-x-6">
                            <div className="bg-gray-50 p-4 rounded-2xl">
                                <Truck className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-2">Express Shipping</h3>
                                <p className="text-gray-500">Fast delivery to your doorstep within 2-4 business days.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-6">
                            <div className="bg-gray-50 p-4 rounded-2xl">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-2">Secure Payments</h3>
                                <p className="text-gray-500">Your transactions are protected by industry-leading encryption.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-6">
                            <div className="bg-gray-50 p-4 rounded-2xl">
                                <Star className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-2">Premium Quality</h3>
                                <p className="text-gray-500">Crafted with the finest materials for lasting comfort and style.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-4xl font-black tracking-tight mb-4">NEW ARRIVALS.</h2>
                            <p className="text-gray-500">Fresh pieces from our latest drop</p>
                        </div>
                        <Link href="/shop" className="hidden md:flex items-center space-x-2 font-bold hover:text-accent transition-colors">
                            <span>View All</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-100 aspect-[3/4] rounded-3xl mb-4"></div>
                                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {featuredProducts.map((product: any) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Category Showcase */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Link href="/shop?category=men" className="relative h-[600px] rounded-3xl overflow-hidden group">
                            <Image
                                src="https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1964&auto=format&fit=crop"
                                alt="Men's Collection"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                            <div className="absolute bottom-12 left-12">
                                <h3 className="text-4xl font-black text-white mb-4">MEN'S <br /> COLLECTION</h3>
                                <span className="inline-flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-xl font-bold">
                                    <span>Shop Now</span>
                                    <ArrowRight className="w-5 h-5" />
                                </span>
                            </div>
                        </Link>

                        <Link href="/shop?category=women" className="relative h-[600px] rounded-3xl overflow-hidden group">
                            <Image
                                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop"
                                alt="Women's Collection"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                            <div className="absolute bottom-12 left-12">
                                <h3 className="text-4xl font-black text-white mb-4">WOMEN'S <br /> COLLECTION</h3>
                                <span className="inline-flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-xl font-bold">
                                    <span>Shop Now</span>
                                    <ArrowRight className="w-5 h-5" />
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-black rounded-[40px] p-12 md:p-24 text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                                JOIN THE CLUB.
                            </h2>
                            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                                Subscribe to receive updates, access to exclusive deals, and more.
                            </p>
                            <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-8 py-5 rounded-2xl bg-white/10 border border-white/20 text-white outline-none focus:border-white transition-colors"
                                />
                                <button className="btn-primary bg-white text-black hover:bg-gray-100 py-5 px-10">
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
