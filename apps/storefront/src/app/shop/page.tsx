'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { Filter, ChevronDown } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function ShopPage() {
    const searchParams = useSearchParams();
    const categorySlug = searchParams.get('category');

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    api.get(`/products?category=${categorySlug || ''}`),
                    api.get('/products/categories')
                ]);
                setProducts(prodRes.data.products);
                setCategories(catRes.data.categories);
            } catch (error) {
                console.error('Failed to fetch shop data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [categorySlug]);

    return (
        <>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-6 md:space-y-0">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2">
                            {categorySlug ? categorySlug.toUpperCase() : 'ALL COLLECTIONS'}
                        </h1>
                        <p className="text-gray-500">Showing {products.length} premium pieces</p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-2 px-4 py-2 border rounded-full text-sm font-medium hover:bg-gray-50">
                            <Filter className="w-4 h-4" />
                            <span>Filter</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2 border rounded-full text-sm font-medium hover:bg-gray-50">
                            <span>Sort By</span>
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 aspect-[3/4] rounded-2xl mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products.map((product: any) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}

                {!loading && products.length === 0 && (
                    <div className="text-center py-24">
                        <h3 className="text-xl font-bold mb-2">No products found</h3>
                        <p className="text-gray-500">Try adjusting your filters or category selection.</p>
                    </div>
                )}
            </div>
        </>
    );
}
