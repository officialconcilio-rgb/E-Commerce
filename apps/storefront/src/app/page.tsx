'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import api from '@/utils/api';
import {
    ArrowRight,
    Truck,
    RotateCcw,
    ShieldCheck,
    Star,
    ChevronRight,
    Gift,
    Heart,
    Sparkles,
    Gem,
    Cake,
    Briefcase,
    Home as HomeIcon,
    Scroll
} from 'lucide-react';

export default function Home() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [categories, setCategories] = useState<any[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const getImageUrl = (url: string) => {
        if (!url) return 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=90&fit=crop';
        if (url.startsWith('http')) return url;
        if (url.startsWith('/uploads/')) {
            return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`;
        }
        return url;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    api.get('/products?limit=4&sort=createdAt_desc'),
                    api.get('/products/categories')
                ]);
                setProducts(productsRes.data.products || []);

                // Map API categories to UI format or fallback to hardcoded if empty
                if (categoriesRes.data.categories && categoriesRes.data.categories.length > 0) {
                    const mappedCategories = categoriesRes.data.categories.map((cat: any) => ({
                        name: cat.name,
                        image: cat.image || 'https://images.unsplash.com/photo-1544120300-30f14897f379?w=800&q=90&fit=crop',
                        href: `/shop?category=${cat.slug}`,
                        discount: cat.description || 'Exclusive Collection',
                        slug: cat.slug
                    }));
                    // Ensure we have at least 5 for the grid layout by repeating or padding if needed
                    // For now, let's just use what we have, but if less than 5, the grid might look empty.
                    // Let's add the hardcoded ones as fallback for any missing slots up to 5 for the specific UI layout
                    const defaultCats = [
                        { name: 'Divine Idols', image: 'https://images.unsplash.com/photo-1544120300-30f14897f379?w=800&q=90&fit=crop', href: '/shop?category=divine-idols', discount: 'Spiritual Grace' },
                        { name: 'Traditional Gifts', image: 'https://images.unsplash.com/photo-1630138221162-818274d8122d?w=800&q=90&fit=crop', href: '/shop?category=traditional', discount: 'Cultural Heritage' },
                        { name: 'Festive Decor', image: 'https://images.unsplash.com/photo-1512411421370-1367468600d4?w=800&q=90&fit=crop', href: '/shop?category=festive', discount: 'Celebratory Charm' },
                        { name: 'Home Decor', image: 'https://images.unsplash.com/photo-1616489953149-8e7cff624976?w=800&q=90&fit=crop', href: '/shop?category=home-decor', discount: 'Elegant Living' },
                        { name: 'Corporate Gifts', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=90&fit=crop', href: '/shop?category=corporate', discount: 'Professional Grace' },
                    ];

                    // Merge: use API categories first, then fill with default if needed to maintain UI structure
                    const finalCats = [...mappedCategories];
                    if (finalCats.length < 5) {
                        finalCats.push(...defaultCats.slice(finalCats.length));
                    }
                    setCategories(finalCats);
                } else {
                    setCategories([
                        { name: 'Divine Idols', image: 'https://images.unsplash.com/photo-1628103144888-c7aefe8556cc', href: '/shop?category=divine-idols', discount: 'Spiritual Grace' },
                        { name: 'Traditional Gifts', image: 'https://images.unsplash.com/photo-1574354245973-2e22c954546b', href: '/shop?category=traditional', discount: 'Cultural Heritage' },
                        { name: 'Festive Decor', image: 'https://images.unsplash.com/photo-1513205166258-204b611e92d6', href: '/shop?category=festive', discount: 'Celebratory Charm' },
                        { name: 'Home Decor', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', href: '/shop?category=home-decor', discount: 'Elegant Living' },
                        { name: 'Corporate Gifts', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48', href: '/shop?category=corporate', discount: 'Professional Grace' },
                    ]);
                }

            } catch (error) {
                console.log('Failed to fetch data');
                setCategories([
                    { name: 'Divine Idols', image: 'https://images.unsplash.com/photo-1628103144888-c7aefe8556cc', href: '/shop?category=divine-idols', discount: 'Spiritual Grace' },
                    { name: 'Traditional Gifts', image: 'https://images.unsplash.com/photo-1574354245973-2e22c954546b', href: '/shop?category=traditional', discount: 'Cultural Heritage' },
                    { name: 'Festive Decor', image: 'https://images.unsplash.com/photo-1513205166258-204b611e92d6', href: '/shop?category=festive', discount: 'Celebratory Charm' },
                    { name: 'Home Decor', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', href: '/shop?category=home-decor', discount: 'Elegant Living' },
                    { name: 'Corporate Gifts', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48', href: '/shop?category=corporate', discount: 'Professional Grace' },
                ]);
            } finally {
                setLoading(false);
                setCategoriesLoading(false);
            }
        };
        fetchData();
    }, []);



    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Banner */}
            <section className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-orange-300 to-amber-400 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-rose-300 to-pink-400 rounded-full blur-3xl"></div>
                </div>

                <div className="container-main relative z-10">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[500px] lg:min-h-[600px] py-12 lg:py-0">
                        <div className="order-2 lg:order-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-sm font-semibold px-4 py-2 rounded-full mb-6">
                                <Sparkles className="w-4 h-4" />
                                Celebrating Traditions with Love
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                                Gifts That<br />
                                <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 bg-clip-text text-transparent">
                                    Tell Stories
                                </span>
                            </h1>
                            <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                                Vagmi Enterprises is a trusted destination for quality gift items, offering a graceful collection that reflects culture, tradition, and heartfelt emotions.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link href="/shop" className="btn-primary px-8 py-4 text-base inline-flex items-center justify-center gap-2">
                                    <Gift className="w-5 h-5" />
                                    Explore Collection
                                </Link>
                                <Link href="/about" className="btn-secondary px-8 py-4 text-base">
                                    Our Story
                                </Link>
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-10 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-green-600" />
                                    <span>100% Authentic</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-blue-600" />
                                    <span>Pan India Delivery</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-rose-500" />
                                    <span>Handpicked Quality</span>
                                </div>
                            </div>
                        </div>

                        <div className="order-1 lg:order-2 relative">
                            <div className="relative max-w-md mx-auto lg:max-w-none">
                                {/* Main Image */}
                                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                                    <Image
                                        src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920&q=90&fit=crop"
                                        alt="Beautiful Gift Collection"
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                                </div>

                                {/* Floating Cards */}
                                <div className="absolute -bottom-4 -left-4 sm:-left-8 bg-white rounded-xl p-4 shadow-xl animate-fade-in">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-2xl">
                                            🎁
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Special Offer</p>
                                            <p className="text-lg font-bold text-gray-800">Up to 40% OFF</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute -top-4 -right-4 sm:-right-8 bg-white rounded-xl p-3 shadow-xl animate-fade-in hidden sm:block">
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-sm">⭐</div>
                                            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-sm">⭐</div>
                                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm">⭐</div>
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-bold text-gray-800">4.9/5</p>
                                            <p className="text-gray-500 text-xs">2k+ Reviews</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Shop by Occasion - Premium Version */}
            <section className="py-20 lg:py-28 relative overflow-hidden bg-white">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-50">
                    <div className="absolute -top-[10%] -left-[5%] w-[30%] h-[30%] bg-amber-100 rounded-full blur-[120px]"></div>
                    <div className="absolute top-[20%] -right-[5%] w-[25%] h-[25%] bg-rose-100 rounded-full blur-[100px]"></div>
                </div>

                <div className="container-main relative z-10">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                        <div className="max-w-xl text-left">
                            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                                Shop by <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-600">Occasion</span>
                            </h2>
                            <p className="text-gray-500 text-lg">
                                Carefully curated collections to make every moment worth celebrating and every gift a lasting memory.
                            </p>
                        </div>
                        <Link href="/shop" className="group flex items-center gap-2 text-amber-600 font-bold hover:text-amber-700 transition-colors">
                            Explore All Moments <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
                        {[
                            { name: 'Wedding', icon: <Gem className="w-8 h-8 lg:w-10 lg:h-10" />, color: 'from-[#fdf4ff] to-[#fae8ff]', iconColor: 'text-[#a21caf]', slug: 'wedding', count: '240+ Items' },
                            { name: 'Festive', icon: <Sparkles className="w-8 h-8 lg:w-10 lg:h-10" />, color: 'from-[#fffbeb] to-[#fef3c7]', iconColor: 'text-[#b45309]', slug: 'festive', count: '180+ Items' },
                            { name: 'Birthday', icon: <Cake className="w-8 h-8 lg:w-10 lg:h-10" />, color: 'from-[#f0f9ff] to-[#e0f2fe]', iconColor: 'text-[#0369a1]', slug: 'birthday', count: '320+ Items' },
                            { name: 'Anniversary', icon: <Heart className="w-8 h-8 lg:w-10 lg:h-10" />, color: 'from-[#fff1f2] to-[#ffe4e6]', iconColor: 'text-[#be123c]', slug: 'anniversary', count: '150+ Items' },
                            { name: 'Corporate', icon: <Briefcase className="w-8 h-8 lg:w-10 lg:h-10" />, color: 'from-[#f8fafc] to-[#f1f5f9]', iconColor: 'text-[#334155]', slug: 'corporate', count: '90+ Items' },
                            { name: 'New Home', icon: <HomeIcon className="w-8 h-8 lg:w-10 lg:h-10" />, color: 'from-[#f0fdf4] to-[#dcfce7]', iconColor: 'text-[#15803d]', slug: 'housewarming', count: '110+ Items' },
                        ].map((item) => (
                            <Link
                                key={item.name}
                                href={`/shop?occasion=${item.slug}`}
                                className="group relative flex flex-col items-center justify-center p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                            >
                                {/* Hover background glow */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                                <div className={`relative z-10 w-20 h-20 lg:w-24 lg:h-24 ${item.color} ${item.iconColor} rounded-3xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                                    {item.icon}
                                </div>

                                <div className="relative z-10 text-center">
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-800 transition-colors mb-1">{item.name}</h3>
                                    <p className="text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition-colors tracking-wider uppercase">{item.count}</p>
                                </div>

                                {/* Bottom decorative line */}
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Premium Static Collections Grid */}
            <section className="py-20 lg:py-24 bg-white">
                <div className="container-main">
                    <div className="text-center mb-16">
                        <span className="text-amber-600 font-bold tracking-wider text-sm uppercase">Discover Excellence</span>
                        <h2 className="text-3xl lg:text-5xl font-serif font-bold text-gray-900 mt-2 mb-4">Our Signature Collections</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto text-lg">Experience the finest craftsmanship with our handpicked selections.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Card 1 */}
                        <Link href="/shop?category=divine-idols" className="group relative h-[400px] rounded-[2.5rem] overflow-hidden">
                            <Image
                                src="/static-assets/hero-1.jpg"
                                alt="Divine Idols"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
                                <h3 className="text-3xl font-bold text-white mb-2">Divine Idols</h3>
                                <p className="text-white/80 font-medium">Spiritual Elegance for your Home</p>
                            </div>
                        </Link>

                        {/* Card 2 */}
                        <Link href="/shop?category=traditional" className="group relative h-[400px] rounded-[2.5rem] overflow-hidden">
                            <Image
                                src="/static-assets/hero-2.jpg"
                                alt="Traditional Crafts"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
                                <h3 className="text-3xl font-bold text-white mb-2">Traditional Crafts</h3>
                                <p className="text-white/80 font-medium">Timeless Indian Heritage</p>
                            </div>
                        </Link>

                        {/* Card 3 */}
                        <Link href="/shop?category=festive" className="group relative h-[400px] rounded-[2.5rem] overflow-hidden">
                            <Image
                                src="/static-assets/hero-3.jpg"
                                alt="Festive Essentials"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
                                <h3 className="text-3xl font-bold text-white mb-2">Festive Essentials</h3>
                                <p className="text-white/80 font-medium">Celebrate with Grandeur</p>
                            </div>
                        </Link>

                        {/* Card 4 */}
                        <Link href="/shop?category=corporate" className="group relative h-[400px] rounded-[2.5rem] overflow-hidden">
                            <Image
                                src="/static-assets/hero-4.jpg"
                                alt="Premium Gifting"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
                                <h3 className="text-3xl font-bold text-white mb-2">Premium Gifting</h3>
                                <p className="text-white/80 font-medium">Exquisite Sweets & Hampers</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Banner */}
            <section className="py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500">
                <div className="container-main">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-white py-2">
                        <div className="flex items-center gap-4">
                            <span className="text-2xl">✨</span>
                            <div>
                                <span className="text-lg lg:text-xl font-bold">Festive Season Sale</span>
                                <span className="hidden sm:inline text-sm opacity-90 ml-4">Extra 20% off on orders above ₹2000</span>
                            </div>
                        </div>
                        <Link href="/shop" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-6 py-2 rounded-full text-sm font-semibold transition-colors">
                            Shop Now <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* New Arrivals */}
            <section className="py-12 lg:py-16 bg-gray-50">
                <div className="container-main">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">New Arrivals</h2>
                            <p className="text-gray-500 mt-1">Fresh additions to our collection</p>
                        </div>
                        <Link href="/shop" className="flex items-center gap-2 text-primary font-semibold hover:underline">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse bg-white rounded-xl p-4">
                                    <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                            {(products.length > 0 ? products.slice(0, 4) : []).map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Premium Features / Trust Section (Replaces Static Images) */}
            <section className="py-20 lg:py-24 bg-white">
                <div className="container-main">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                        <div className="order-2 lg:order-1 grid grid-cols-2 gap-6">
                            {[
                                { title: "Artisanal Mastery", desc: "Handcrafted by award-winning artisans.", icon: <Sparkles className="w-6 h-6" /> },
                                { title: "100% Authentic", desc: "Sourced directly, certified purity.", icon: <ShieldCheck className="w-6 h-6" /> },
                                { title: "Secure Shipping", desc: "Damage-proof premium packaging.", icon: <Truck className="w-6 h-6" /> },
                                { title: "Cultural Legacy", desc: "Preserving ancient Indian traditions.", icon: <Scroll className="w-6 h-6" /> },
                            ].map((feature, i) => (
                                <div key={i} className="group p-6 bg-gray-50 rounded-[2rem] hover:bg-amber-50 hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-500 hover:-translate-y-2 border border-transparent hover:border-amber-100">
                                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform duration-500">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                    <p className="text-sm text-gray-500 group-hover:text-gray-700">{feature.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="order-1 lg:order-2 flex flex-col justify-center">
                            <div className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full bg-rose-50 text-rose-600 font-bold text-xs uppercase tracking-wider mb-6">
                                <Heart className="w-4 h-4 fill-rose-600" />
                                The Vagmi Promise
                            </div>
                            <h2 className="text-3xl lg:text-5xl font-serif font-bold text-gray-900 mb-6 leading-tight">
                                More Than Just a Gift, It's an <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-600">Emotion</span>.
                            </h2>
                            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                                We believe in the power of thoughtful gifting. Each piece in our collection is chosen not just for its beauty, but for the story it tells and the tradition it upholds. Experience the joy of giving with Vagmi.
                            </p>
                            <div className="flex gap-4">
                                <Link href="/about" className="px-8 py-4 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-300">
                                    Our Story
                                </Link>
                                <Link href="/contact" className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-semibold hover:bg-gray-50 transition-colors">
                                    Contact Us
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Why Choose Us */}
            <section className="py-12 lg:py-16 bg-gradient-to-b from-gray-50 to-white">
                <div className="container-main">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-3">Why Choose Vagmi?</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Vagmi Enterprises stands for trust, quality, and tradition. Our gift collection is designed to celebrate festivals, family bonds, and special moments with grace and authenticity.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        <FeatureCard
                            icon={<Gift className="w-8 h-8" />}
                            title="Curated Selection"
                            description="Handpicked items with cultural significance"
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="w-8 h-8" />}
                            title="Quality Assured"
                            description="Every piece meets our high standards"
                        />
                        <FeatureCard
                            icon={<Truck className="w-8 h-8" />}
                            title="Safe Delivery"
                            description="Careful packaging across India"
                        />
                        <FeatureCard
                            icon={<Heart className="w-8 h-8" />}
                            title="Made with Love"
                            description="Supporting local artisans"
                        />
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-12 lg:py-16 bg-white">
                <div className="container-main">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-3">What Our Customers Say</h2>
                        <p className="text-gray-500">Join thousands of happy customers</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { name: 'Priya M.', text: "Beautiful collection! The Ganesh idol I ordered was exactly as shown. Perfect for my new home.", rating: 5 },
                            { name: 'Rahul S.', text: "Ordered corporate gifts for Diwali. Excellent quality and packaging. Our clients loved them!", rating: 5 },
                            { name: 'Anita K.', text: "Found the perfect wedding gift. The brass lamp set is stunning. Will order again!", rating: 5 },
                        ].map((review, i) => (
                            <div key={i} className="bg-gray-50 rounded-2xl p-6 lg:p-8">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(review.rating)].map((_, j) => (
                                        <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-4 leading-relaxed">"{review.text}"</p>
                                <p className="font-semibold text-gray-800">— {review.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="py-16 lg:py-20 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600">
                <div className="container-main text-center">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-2xl lg:text-4xl font-bold text-white mb-4">
                            Join Our Community
                        </h2>
                        <p className="text-white/80 mb-8 text-lg">
                            Subscribe for exclusive offers, new arrivals, and festive updates.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="flex-1 px-6 py-4 rounded-xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-white/30"
                            />
                            <button type="submit" className="bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                                Subscribe
                            </button>
                        </form>
                        <p className="text-white/60 text-sm mt-4">Get 10% off on your first order</p>
                    </div>
                </div>
            </section>

        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="text-center p-6 lg:p-8 bg-white rounded-2xl shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 rounded-2xl mb-4">
                {icon}
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    );
}
