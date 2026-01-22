'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import api from '@/utils/api';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { Filter, ChevronDown } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

function ShopContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const categorySlug = searchParams.get('category');
    const sortParam = searchParams.get('sort');

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    // UI States
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Refs for clicking outside
    const sortRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: any) {
            if (sortRef.current && !sortRef.current.contains(event.target)) {
                setIsSortOpen(false);
            }
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let sortQuery = '';
                if (sortParam === 'price_asc') sortQuery = '&sort=price_asc';
                if (sortParam === 'price_desc') sortQuery = '&sort=price_desc';

                const [prodRes, catRes] = await Promise.all([
                    api.get(`/products?category=${categorySlug || ''}${sortQuery}`),
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
    }, [categorySlug, sortParam]);

    const handleSort = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (params.get('sort') === value) {
            params.delete('sort');
        } else {
            params.set('sort', value);
        }
        router.push(`/shop?${params.toString()}`);
        setIsSortOpen(false);
    };

    const handleCategoryFilter = (slug: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slug) {
            params.set('category', slug);
        } else {
            params.delete('category');
        }
        router.push(`/shop?${params.toString()}`);
        setIsFilterOpen(false);
    };

    const sortOptions = [
        { label: 'Newest', value: 'newest' },
        { label: 'Price: Low to High', value: 'price_asc' },
        { label: 'Price: High to Low', value: 'price_desc' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-6 md:space-y-0">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">
                        {categorySlug ? categorySlug.toUpperCase().replace('-', ' ') : 'ALL COLLECTIONS'}
                    </h1>
                    <p className="text-gray-500">Showing {products.length} premium pieces</p>
                </div>

                <div className="flex items-center space-x-4 relative">
                    {/* Filter Dropdown */}
                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center space-x-2 px-4 py-2 border rounded-full text-sm font-medium transition-colors ${isFilterOpen ? 'bg-black text-white border-black' : 'hover:bg-gray-50'}`}
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filter</span>
                        </button>

                        {isFilterOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</span>
                                </div>
                                <button
                                    onClick={() => handleCategoryFilter(null)}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${!categorySlug ? 'text-black font-medium' : 'text-gray-600'}`}
                                >
                                    All Categories
                                </button>
                                {categories.map((cat: any) => (
                                    <button
                                        key={cat._id}
                                        onClick={() => handleCategoryFilter(cat.slug)}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${categorySlug === cat.slug ? 'text-black font-medium' : 'text-gray-600'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative" ref={sortRef}>
                        <button
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className={`flex items-center space-x-2 px-4 py-2 border rounded-full text-sm font-medium transition-colors ${isSortOpen ? 'bg-black text-white border-black' : 'hover:bg-gray-50'}`}
                        >
                            <span>Sort By</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isSortOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                {sortOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleSort(option.value)}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortParam === option.value ? 'text-black font-medium' : 'text-gray-600'}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
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
                    <button
                        onClick={() => {
                            router.push('/shop');
                        }}
                        className="mt-4 px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-900"
                    >
                        Clear all filters
                    </button>
                </div>
            )}
        </div>
    );
}

export default function ShopPage() {
    return (
        <>
            <Navbar />
            <Suspense fallback={<div>Loading...</div>}>
                <ShopContent />
            </Suspense>
        </>
    );
}
