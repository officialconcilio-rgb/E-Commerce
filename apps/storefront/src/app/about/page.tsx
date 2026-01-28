'use client';

import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Gift, Heart, Award, Users, CheckCircle, ArrowRight, Sparkles, Star } from 'lucide-react';

export default function AboutPage() {
    const stats = [
        { number: '10K+', label: 'Happy Customers' },
        { number: '500+', label: 'Gift Collection' },
        { number: '50+', label: 'Artisan Partners' },
        { number: '4.9', label: 'Customer Rating' },
    ];

    const values = [
        { icon: <Gift className="w-8 h-8" />, title: 'Curated Selection', description: 'Every gift is handpicked for its cultural significance and quality.' },
        { icon: <Heart className="w-8 h-8" />, title: 'Made with Love', description: 'Supporting local artisans who pour their heart into each creation.' },
        { icon: <Award className="w-8 h-8" />, title: 'Quality Assured', description: 'Rigorous quality checks ensure every piece meets our standards.' },
        { icon: <Users className="w-8 h-8" />, title: 'Community First', description: 'Building lasting relationships with our customers and partners.' },
    ];

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero */}
            <section className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 py-16 lg:py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-20 left-10 w-40 h-40 bg-amber-300 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-60 h-60 bg-rose-300 rounded-full blur-3xl"></div>
                </div>
                <div className="container-main relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-amber-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
                            <Sparkles className="w-4 h-4" />
                            Since 2020
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-bold text-gray-800 mb-6">
                            Celebrating Traditions,<br />
                            <span className="text-gradient">One Gift at a Time</span>
                        </h1>
                        <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                            Vagmi Enterprises is a trusted destination for quality gift items, offering a graceful collection
                            that reflects culture, tradition, and heartfelt emotions.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 lg:py-16 bg-white border-b border-gray-100">
                <div className="container-main">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-3xl lg:text-5xl font-bold text-gradient mb-2">{stat.number}</p>
                                <p className="text-gray-600 text-sm lg:text-base">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-12 lg:py-20">
                <div className="container-main">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                        <div className="relative">
                            <div className="aspect-[4/5] relative rounded-2xl overflow-hidden shadow-xl">
                                <Image
                                    src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1920&q=90&fit=crop"
                                    alt="Beautiful Gifts"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                            </div>
                            {/* Floating card */}
                            <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-4 shadow-lg hidden lg:block">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl">
                                        🎁
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Trusted by</p>
                                        <p className="font-bold text-gray-800">10,000+ Customers</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <span className="inline-block text-amber-600 font-semibold uppercase tracking-wide text-sm mb-3">Our Story</span>
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">
                                Preserving Heritage Through Meaningful Gifts
                            </h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    Born from a deep appreciation for India's rich cultural heritage, Vagmi Enterprises
                                    was founded with a simple yet profound mission: to help people express their love,
                                    respect, and gratitude through thoughtfully curated gifts.
                                </p>
                                <p>
                                    We believe every gift carries a message – of love, of tradition, of celebration.
                                    That's why we work directly with skilled artisans across India to bring you pieces
                                    that are not just beautiful, but meaningful.
                                </p>
                                <p>
                                    From divine idols for your pooja room to elegant home decor that transforms spaces,
                                    from festive hampers that spread joy to corporate gifts that leave lasting impressions –
                                    each item in our collection is chosen with care.
                                </p>
                            </div>

                            <div className="mt-8 space-y-3">
                                {['Authentic handcrafted products', 'Supporting local artisans', 'Pan-India delivery', 'Careful premium packaging'].map((item) => (
                                    <div key={item} className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <span className="text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <Link href="/shop" className="btn-primary mt-8 inline-flex items-center gap-2">
                                Explore Our Collection <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section className="py-12 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="container-main">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <span className="inline-block text-amber-600 font-semibold uppercase tracking-wide text-sm mb-3">Our Mission</span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">
                            Making Every Occasion Memorable
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            We are committed to bringing you a refined selection of gift items rooted in tradition
                            and timeless values. Each piece is chosen with care to make every occasion memorable and meaningful.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        {values.map((value) => (
                            <div key={value.title} className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 rounded-2xl mb-4">
                                    {value.icon}
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-2">{value.title}</h3>
                                <p className="text-sm text-gray-500">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-12 lg:py-20 bg-white">
                <div className="container-main">
                    <div className="text-center mb-12">
                        <span className="inline-block text-amber-600 font-semibold uppercase tracking-wide text-sm mb-3">Testimonials</span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">What Our Customers Say</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                name: 'Meera S.',
                                location: 'Mumbai',
                                text: "I ordered a beautiful Ganesh idol for my new home. The quality exceeded my expectations. The packaging was so careful – it felt like receiving a blessing.",
                                rating: 5
                            },
                            {
                                name: 'Rajesh K.',
                                location: 'Bangalore',
                                text: "We ordered Diwali gift hampers for our corporate clients. Vagmi's team was extremely helpful with bulk orders. Our clients loved the traditional touch!",
                                rating: 5
                            },
                            {
                                name: 'Priya M.',
                                location: 'Delhi',
                                text: "Found the perfect wedding gift – a brass lamp set that my friend absolutely loved. The craftsmanship is authentic and the prices are reasonable.",
                                rating: 5
                            },
                        ].map((review, i) => (
                            <div key={i} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 lg:p-8">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(review.rating)].map((_, j) => (
                                        <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 leading-relaxed">"{review.text}"</p>
                                <div>
                                    <p className="font-semibold text-gray-800">{review.name}</p>
                                    <p className="text-sm text-gray-500">{review.location}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 lg:py-20 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600">
                <div className="container-main text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                        Ready to Find the Perfect Gift?
                    </h2>
                    <p className="text-white/80 mb-8 max-w-xl mx-auto text-lg">
                        Explore our curated collection of traditional gifts that celebrate culture and spread joy.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/shop" className="bg-white text-amber-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2">
                            <Gift className="w-5 h-5" />
                            Shop Now
                        </Link>
                        <Link href="/contact" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}
