'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/utils/api';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw, Star, ChevronRight, Gift, Package } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

interface Variant {
    _id: string;
    size: string;
    color: string;
    stock: number;
    priceOverride?: number;
}

interface Product {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    brand?: string;
    price: number;
    discount?: number;
    discountPrice?: number;
    images: string[];
    rating?: number;
    reviewCount?: number;
    category?: { name: string };
    stock?: number;
}

export default function ProductDetailPage() {
    const { slug } = useParams();
    const router = useRouter();
    const { addItem } = useCartStore();
    const { isAuthenticated } = useAuthStore();

    const [product, setProduct] = useState<Product | null>(null);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    // Connect to wishlist store
    const { toggleWishlist, isInWishlist } = useWishlistStore();
    const isWishlisted = product ? isInWishlist(product._id) : false;

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${slug}`);
                setProduct(res.data.product);
                setVariants(res.data.variants || []);
                if (res.data.variants?.length > 0) {
                    setSelectedSize(res.data.variants[0].size);
                    setSelectedColor(res.data.variants[0].color);
                }
            } catch (error) {
                console.error('Failed to fetch product');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const variant = variants.find(v => v.size === selectedSize && v.color === selectedColor);
        if (!variant || !product) return;

        setAdding(true);
        await addItem({
            productId: product._id,
            variantId: variant._id,
            quantity: 1
        });
        setAdding(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="container-main py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        <div className="space-y-4">
                            <div className="aspect-square bg-gray-200 animate-pulse rounded-xl"></div>
                            <div className="grid grid-cols-4 gap-2">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-200 animate-pulse rounded w-1/4"></div>
                            <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4"></div>
                            <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="container-main py-16 text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-12 h-12 text-gray-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h1>
                    <Link href="/shop" className="btn-primary">Continue Shopping</Link>
                </div>
            </div>
        );
    }

    const sizes = [...new Set(variants.map(v => v.size))];
    const colors = [...new Set(variants.map(v => v.color))];
    const selectedVariant = variants.find(v => v.size === selectedSize && v.color === selectedColor);

    // Robust price calculation
    const basePrice = product.discountPrice || product.price;
    const currentPrice = selectedVariant?.priceOverride || basePrice;

    const discount = product.discount || (product.discountPrice
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Breadcrumb */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="container-main py-3">
                    <nav className="flex items-center text-sm text-gray-500 overflow-x-auto whitespace-nowrap">
                        <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4 mx-2 shrink-0" />
                        <Link href="/shop" className="hover:text-amber-600 transition-colors">Shop</Link>
                        <ChevronRight className="w-4 h-4 mx-2 shrink-0" />
                        <span className="text-gray-800 truncate max-w-[200px]">{product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="container-main py-6 lg:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
                    {/* Image Gallery */}
                    <div className="flex flex-col-reverse lg:flex-row gap-4">
                        {/* Thumbnails */}
                        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:w-20 lg:max-h-[500px]">
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={`relative w-16 h-20 lg:w-full lg:h-24 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-amber-500' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <Image src={img} alt="" fill className="object-cover" />
                                </button>
                            ))}
                        </div>

                        {/* Main Image */}
                        <div className="flex-1 relative">
                            <div className="relative aspect-square lg:aspect-[4/5] rounded-xl overflow-hidden bg-gray-100">
                                <Image
                                    src={product.images[selectedImage] || 'https://via.placeholder.com/800x1000'}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-cover"
                                    priority
                                />
                                {discount > 0 && (
                                    <span className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
                                        {discount}% OFF
                                    </span>
                                )}
                                <button
                                    onClick={() => {
                                        if (!isAuthenticated) return router.push('/login');
                                        if (product) toggleWishlist(product._id);
                                    }}
                                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow flex items-center justify-center hover:scale-110 transition-transform"
                                >
                                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        {/* Brand & Name */}
                        <div className="mb-4">
                            <p className="text-lg font-semibold text-amber-600 mb-1">
                                {product.brand || 'VAGMI'}
                            </p>
                            <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
                                {product.name}
                            </h1>
                        </div>

                        {/* Rating */}
                        {product.rating && (
                            <div className="flex items-center gap-3 mb-4">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded">
                                    {product.rating} <Star className="w-3 h-3 fill-current" />
                                </span>
                                <span className="text-sm text-gray-500">
                                    {product.reviewCount || 0} Ratings
                                </span>
                                {(product.stock !== undefined && product.stock > 0 && product.stock < 5) && (
                                    <span className="text-sm font-bold text-amber-600 animate-pulse bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                        Only {product.stock} left in stock!
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Divider */}
                        <div className="border-b border-gray-200 my-4"></div>

                        {/* Price */}
                        <div className="mb-6">
                            <div className="flex items-baseline gap-3 flex-wrap">
                                <span className="text-2xl lg:text-3xl font-bold text-gray-800">₹{currentPrice}</span>
                                {product.discountPrice && (
                                    <>
                                        <span className="text-lg text-gray-400 line-through">₹{product.price}</span>
                                        <span className="text-lg text-green-600 font-semibold">({discount}% OFF)</span>
                                    </>
                                )}
                            </div>
                            <p className="text-sm text-green-600 font-medium mt-1">inclusive of all taxes</p>
                        </div>

                        {/* Size Selection */}
                        {sizes.length > 0 && sizes[0] && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Select Size</h3>
                                    <button className="text-amber-600 text-sm font-semibold hover:underline">
                                        Size Guide
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {sizes.map((size) => {
                                        if (!size) return null;
                                        const variant = variants.find(v => v.size === size && v.color === selectedColor);
                                        const isAvailable = variant && variant.stock > 0;
                                        return (
                                            <button
                                                key={size}
                                                onClick={() => isAvailable && setSelectedSize(size)}
                                                disabled={!isAvailable}
                                                className={`min-w-[50px] h-11 px-4 border rounded-lg font-medium text-sm transition-all ${selectedSize === size
                                                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                    : isAvailable
                                                        ? 'border-gray-300 text-gray-700 hover:border-amber-400'
                                                        : 'border-gray-200 text-gray-300 line-through cursor-not-allowed'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Color Selection */}
                        {colors.length > 1 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-3">Select Color</h3>
                                <div className="flex flex-wrap gap-2">
                                    {colors.map((color) => {
                                        if (!color) return null;
                                        return (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`px-4 py-2 border rounded-full text-sm font-medium transition-all ${selectedColor === color
                                                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                    : 'border-gray-300 text-gray-700 hover:border-amber-400'
                                                    }`}
                                            >
                                                {color}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 mb-8">
                            <button
                                onClick={handleAddToCart}
                                disabled={adding || !selectedVariant}
                                className="flex-1 btn-primary py-4 text-base flex items-center justify-center gap-2"
                            >
                                {adding ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag className="w-5 h-5" />
                                        Add to Bag
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    if (!isAuthenticated) return router.push('/login');
                                    if (product) toggleWishlist(product._id);
                                }}
                                className="btn-secondary px-5 py-4"
                            >
                                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                            </button>
                        </div>

                        {/* Delivery Check */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <h3 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                                <Truck className="w-4 h-4" />
                                Delivery Options
                            </h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter pincode"
                                    maxLength={6}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                                />
                                <button className="text-amber-600 font-semibold text-sm px-4 hover:underline">Check</button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Enter PIN code to check delivery time & availability
                            </p>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-4 bg-amber-50 rounded-xl">
                                <Truck className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                                <p className="text-xs text-gray-700 font-medium">Free Delivery</p>
                            </div>
                            <div className="text-center p-4 bg-amber-50 rounded-xl">
                                <RotateCcw className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                                <p className="text-xs text-gray-700 font-medium">Easy Returns</p>
                            </div>
                            <div className="text-center p-4 bg-amber-50 rounded-xl">
                                <ShieldCheck className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                                <p className="text-xs text-gray-700 font-medium">100% Authentic</p>
                            </div>
                        </div>

                        {/* Product Description */}
                        {product.description && (
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-3">Product Details</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                            </div>
                        )}

                        {/* Gift Note */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                            <div className="flex items-start gap-3">
                                <Gift className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">Gift Wrapping Available</p>
                                    <p className="text-xs text-gray-600 mt-1">Add a special touch with our premium gift packaging</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
