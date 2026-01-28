'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SliderItem {
    id: string;
    image: string;
    title: string;
    category: string;
    price: number | string;
    slug?: string;
}

interface AngledSliderProps {
    items: SliderItem[];
}

export function AngledSlider({ items }: AngledSliderProps) {
    const loopedItems = [...items, ...items, ...items];

    return (
        <div className="w-full py-12 overflow-hidden">
            <div className="relative">
                <div
                    className="flex gap-8 px-4"
                    style={{
                        animation: 'marquee 40s linear infinite',
                    }}
                >
                    {loopedItems.map((item, index) => (
                        <Card key={`${item.id}-${index}`} item={item} />
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}

function Card({ item }: { item: SliderItem }) {
    return (
        <div
            className="relative w-[320px] h-[450px] overflow-hidden flex-shrink-0 transition-all duration-700 hover:scale-105 group"
            style={{
                background: '#121212',
                border: '1px solid rgba(255,255,255,0.05)',
            }}
        >
            {/* Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                <span
                    className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest mb-3"
                    style={{ background: '#D4AF37', color: '#000' }}
                >
                    {item.category}
                </span>
                <h3 className="text-2xl font-bold text-white mb-2 leading-tight uppercase tracking-wide">
                    {item.title}
                </h3>
                <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
                    <p className="text-xl font-bold" style={{ color: '#D4AF37' }}>
                        {typeof item.price === 'number' ? `₹${item.price}` : item.price}
                    </p>
                    {item.slug ? (
                        <Link
                            href={`/product/${item.slug}`}
                            className="w-10 h-10 flex items-center justify-center text-black transition-all duration-300"
                            style={{ background: '#D4AF37' }}
                        >
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    ) : (
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                            Soon
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AngledSlider;
