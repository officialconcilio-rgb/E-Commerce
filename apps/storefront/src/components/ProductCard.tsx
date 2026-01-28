'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Heart, Star, Eye } from 'lucide-react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
    product: any;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=90&fit=crop';

export default function ProductCard({ product }: ProductCardProps) {
    const getImageUrl = (url: string) => {
        if (!url) return FALLBACK_IMAGE;
        if (url.startsWith('http')) return url;
        // If it's a relative path from our API upload
        if (url.startsWith('/uploads/')) {
            return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`;
        }
        return url;
    };

    const [imgSrc, setImgSrc] = useState(getImageUrl(product.images?.[0]));
    const [imageLoaded, setImageLoaded] = useState(false);

    const { toggleWishlist, isInWishlist } = useWishlistStore();
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const isWishlisted = isInWishlist(product._id);

    const discount = product.discount || (product.discountPrice
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0);

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            router.push('/login?redirect=' + window.location.pathname);
            return;
        }
        toggleWishlist(product._id);
    };

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/product/${product.slug}`);
    };

    return (
        <Link
            href={`/product/${product.slug}`}
            className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
        >
            <div className="relative aspect-square sm:aspect-[3/4] overflow-hidden bg-gray-100">
                {/* Loading skeleton */}
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                )}

                <Image
                    src={imgSrc}
                    alt={product.name}
                    fill
                    className={`object-cover transition-all duration-500 ${product.hoverImage ? 'group-hover:opacity-0' : 'group-hover:scale-110'} ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImgSrc(FALLBACK_IMAGE)}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />

                {product.hoverImage && (
                    <Image
                        src={product.hoverImage}
                        alt={product.name}
                        fill
                        className="object-cover transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                )}

                {/* Discount Badge */}
                {discount > 0 && (
                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full shadow-sm z-10">
                        {discount}% OFF
                    </span>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlist}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-white z-10"
                >
                    <Heart
                        className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`}
                    />
                </button>

                {/* Quick Add Button - Mobile: always visible, Desktop: hover */}
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/60 to-transparent sm:translate-y-full sm:group-hover:translate-y-0 transition-transform z-10">
                    <button
                        onClick={handleQuickAdd}
                        className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 py-2 sm:py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">View</span>
                    </button>
                </div>
            </div>

            <div className="p-3 sm:p-4">
                {/* Brand */}
                <p className="text-[10px] sm:text-xs font-semibold text-amber-600 uppercase tracking-widest mb-1">
                    {product.brand || 'Vagmi'}
                </p>

                {/* Product Name */}
                <h3 className="font-medium text-gray-800 text-sm lg:text-base line-clamp-2 mb-2 group-hover:text-amber-700 transition-colors min-h-[2.5rem]">
                    {product.name}
                </h3>

                {/* Rating & Stock */}
                <div className="flex items-center justify-between gap-2 mb-2">
                    {product.rating && (
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] sm:text-xs font-semibold rounded">
                                {product.rating} <Star className="w-3 h-3 fill-current" />
                            </span>
                            <span className="text-[10px] sm:text-xs text-gray-400">({product.reviewCount || 0})</span>
                        </div>
                    )}
                    {(product.stock !== undefined && product.stock > 0 && product.stock < 5) && (
                        <span className="text-[10px] font-bold text-amber-600 animate-pulse">Low Stock</span>
                    )}
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-800 text-sm sm:text-base">
                        ₹{product.discountPrice || product.price}
                    </span>
                    {product.discountPrice && (
                        <>
                            <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                                ₹{product.price}
                            </span>
                            <span className="text-[10px] sm:text-xs text-green-600 font-semibold">
                                ({discount}% off)
                            </span>
                        </>
                    )}
                </div>
            </div>
        </Link>
    );
}
