'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/utils/api';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useRouter } from 'next/navigation';

export default function ProductDetailPage() {
    const { slug } = useParams();
    const router = useRouter();
    const { addItem } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const { settings, fetchSettings } = useSettingsStore();

    const [product, setProduct] = useState<any>(null);
    const [variants, setVariants] = useState<any[]>([]);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchSettings();
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${slug}`);
                setProduct(res.data.product);
                setVariants(res.data.variants);
                if (res.data.variants.length > 0) {
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
        if (!variant) return;

        setAdding(true);
        await addItem({
            productId: product._id,
            variantId: variant._id,
            quantity: 1
        });
        setAdding(false);
    };

    if (loading) return <div className="animate-pulse p-24">Loading...</div>;
    if (!product) return <div className="p-24 text-center">Product not found</div>;

    const sizes = [...new Set(variants.map(v => v.size))];
    const colors = [...new Set(variants.map(v => v.color))];

    return (
        <>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-gray-100">
                            <Image
                                src={product.images[0] || 'https://via.placeholder.com/800x1066'}
                                alt={product.name}
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {product.images.slice(1).map((img: string, i: number) => (
                                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                                    <Image src={img} alt={product.name} fill sizes="25vw" className="object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-8">
                        <div>
                            <p className="text-accent font-bold text-sm tracking-widest uppercase mb-2">
                                {product.category?.name}
                            </p>
                            <h1 className="text-5xl font-black tracking-tight mb-4">{product.name}</h1>
                            <div className="flex items-center space-x-4">
                                <span className="text-3xl font-black">₹{product.discountPrice || product.basePrice}</span>
                                {product.discountPrice && (
                                    <span className="text-xl text-gray-400 line-through">₹{product.basePrice}</span>
                                )}
                            </div>
                        </div>

                        <p className="text-gray-600 leading-relaxed text-lg">
                            {product.description}
                        </p>

                        {/* Variants */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold uppercase tracking-wider mb-3">Select Size</label>
                                <div className="flex flex-wrap gap-3">
                                    {sizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-6 py-3 rounded-xl border-2 font-bold transition-all ${selectedSize === size
                                                ? 'border-black bg-black text-white'
                                                : 'border-gray-100 hover:border-gray-300'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold uppercase tracking-wider mb-3">Select Color</label>
                                <div className="flex flex-wrap gap-3">
                                    {colors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`px-6 py-3 rounded-xl border-2 font-bold transition-all ${selectedColor === color
                                                ? 'border-black bg-black text-white'
                                                : 'border-gray-100 hover:border-gray-300'
                                                }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-4 pt-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={adding}
                                className="flex-1 btn-primary py-5 flex items-center justify-center space-x-3 disabled:opacity-50"
                            >
                                <ShoppingBag className="w-6 h-6" />
                                <span className="text-lg font-bold">{adding ? 'Adding...' : 'Add to Bag'}</span>
                            </button>
                            <button className="p-5 border-2 border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                                <Heart className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-100">
                            <div className="flex items-center space-x-3 text-sm text-gray-500">
                                <Truck className="w-5 h-5 text-black" />
                                <span>{settings.freeShippingThreshold > 0 ? `Free Shipping over ₹${settings.freeShippingThreshold}` : 'Free Shipping'}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm text-gray-500">
                                <RotateCcw className="w-5 h-5 text-black" />
                                <span>{settings.returnPeriodDays}-Day Returns</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm text-gray-500">
                                <ShieldCheck className="w-5 h-5 text-black" />
                                <span>Secure Checkout</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
