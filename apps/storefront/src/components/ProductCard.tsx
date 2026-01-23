import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface ProductCardProps {
    product: any;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500';

export default function ProductCard({ product }: ProductCardProps) {
    const [imgSrc, setImgSrc] = useState(product.images?.[0] || FALLBACK_IMAGE);

    return (
        <Link href={`/product/${product.slug}`} className="group">
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 rounded-2xl mb-4">
                <Image
                    src={imgSrc}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={() => setImgSrc(FALLBACK_IMAGE)}
                />
                {product.discountPrice && (
                    <div className="absolute top-4 left-4 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                        SALE
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <h3 className="font-bold text-gray-900 group-hover:text-accent transition-colors">
                    {product.name}
                </h3>
                <p className="text-sm text-gray-500">{product.category?.name}</p>
                <div className="flex items-center space-x-2">
                    <span className="font-black">₹{product.discountPrice || product.basePrice}</span>
                    {product.discountPrice && (
                        <span className="text-sm text-gray-400 line-through">₹{product.basePrice}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
