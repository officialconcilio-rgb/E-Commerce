'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import api from '@/utils/api';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { Filter, ChevronDown, X, Grid, LayoutGrid, SlidersHorizontal, Gift } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
    _id: string;
    name: string;
    slug: string;
}

interface Product {
    _id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number;
    images: string[];
    brand?: string;
    category?: Category;
    rating?: number;
    reviewCount?: number;
}

function ShopContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const categorySlug = searchParams.get('category');
    const sortParam = searchParams.get('sort');
    const searchParam = searchParams.get('search');
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const minDiscountParam = searchParams.get('minDiscount');

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [hasAnyProducts, setHasAnyProducts] = useState(true);

    // UI States
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [gridCols, setGridCols] = useState(4);

    // Refs for clicking outside
    const sortRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setIsSortOpen(false);
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
                if (sortParam === 'newest') sortQuery = '&sort=createdAt_desc';
                if (sortParam === 'discount') sortQuery = '&sort=discount_desc';

                const filterQuery = `&minPrice=${minPriceParam || ''}&maxPrice=${maxPriceParam || ''}&minDiscount=${minDiscountParam || ''}`;

                const [prodRes, catRes, totalRes] = await Promise.all([
                    api.get(`/products?category=${categorySlug || ''}${sortQuery}${searchParam ? `&search=${searchParam}` : ''}${filterQuery}`),
                    api.get('/products/categories'),
                    api.get('/products?limit=1') // Check if any products exist at all
                ]);
                setProducts(prodRes.data.products || []);
                const allCategories = catRes.data.categories || [];
                setCategories(allCategories.filter((c: any) => c.isActive));
                setHasAnyProducts(totalRes.data.count > 0);
            } catch (error) {
                console.error('Failed to fetch shop data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [categorySlug, sortParam, searchParam, minPriceParam, maxPriceParam, minDiscountParam]);

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

    const handlePriceFilter = (min: number | null, max: number | null) => {
        const params = new URLSearchParams(searchParams.toString());
        // Toggle behavior
        const isCurrentlySelected = (params.get('minPrice') || '') === (min?.toString() || '') &&
            (params.get('maxPrice') || '') === (max?.toString() || '');

        if (isCurrentlySelected) {
            params.delete('minPrice');
            params.delete('maxPrice');
        } else {
            if (min !== null) params.set('minPrice', min.toString()); else params.delete('minPrice');
            if (max !== null) params.set('maxPrice', max.toString()); else params.delete('maxPrice');
        }
        router.push(`/shop?${params.toString()}`);
    };

    const handleDiscountFilter = (min: number | null) => {
        const params = new URLSearchParams(searchParams.toString());
        const isCurrentlySelected = (params.get('minDiscount') || '') === (min?.toString() || '');

        if (isCurrentlySelected) {
            params.delete('minDiscount');
        } else {
            if (min !== null) params.set('minDiscount', min.toString()); else params.delete('minDiscount');
        }
        router.push(`/shop?${params.toString()}`);
    };

    const sortOptions = [
        { label: 'Recommended', value: 'recommended' },
        { label: "What's New", value: 'newest' },
        { label: 'Price: Low to High', value: 'price_asc' },
        { label: 'Price: High to Low', value: 'price_desc' },
        { label: 'Better Discount', value: 'discount' },
    ];

    const currentSort = sortOptions.find(s => s.value === sortParam)?.label || 'Recommended';
    const currentCategory = categories.find((c) => c.slug === categorySlug);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="container-main py-3">
                    <nav className="text-sm text-gray-500">
                        <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-800">
                            {searchParam ? `Search: ${searchParam}` : (currentCategory?.name || 'All Products')}
                        </span>
                    </nav>
                </div>
            </div>

            <div className="container-main py-6 lg:py-8">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Sidebar Filters - Desktop */}
                    <aside className="hidden lg:block w-60 shrink-0">
                        <div className="sticky top-28 bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-6">Filters</h2>

                            {/* Categories */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Categories</h3>
                                <ul className="space-y-2">
                                    <li>
                                        <button
                                            onClick={() => handleCategoryFilter(null)}
                                            className={`text-sm w-full text-left py-1.5 transition-colors ${!categorySlug ? 'text-amber-600 font-semibold' : 'text-gray-600 hover:text-amber-600'}`}
                                        >
                                            All Products
                                        </button>
                                    </li>
                                    {categories.map((cat) => (
                                        <li key={cat._id}>
                                            <button
                                                onClick={() => handleCategoryFilter(cat.slug)}
                                                className={`text-sm w-full text-left py-1.5 transition-colors ${categorySlug === cat.slug ? 'text-amber-600 font-semibold' : 'text-gray-600 hover:text-amber-600'}`}
                                            >
                                                {cat.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Price</h3>
                                <ul className="space-y-2">
                                    {[
                                        { label: 'Under ₹500', min: null, max: 500 },
                                        { label: '₹500 - ₹1000', min: 500, max: 1000 },
                                        { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
                                        { label: 'Above ₹2000', min: 2000, max: null }
                                    ].map((range) => {
                                        const isChecked = (minPriceParam || '') === (range.min?.toString() || '') &&
                                            (maxPriceParam || '') === (range.max?.toString() || '');
                                        return (
                                            <li key={range.label}>
                                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-amber-600">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handlePriceFilter(range.min, range.max)}
                                                        className="accent-amber-600 w-4 h-4 rounded"
                                                    />
                                                    {range.label}
                                                </label>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            {/* Discount */}
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Discount</h3>
                                <ul className="space-y-2">
                                    {[
                                        { label: '10% and above', min: 10 },
                                        { label: '20% and above', min: 20 },
                                        { label: '30% and above', min: 30 },
                                        { label: '50% and above', min: 50 }
                                    ].map((range) => {
                                        const isChecked = (minDiscountParam || '') === range.min.toString();
                                        return (
                                            <li key={range.label}>
                                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-amber-600">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handleDiscountFilter(range.min)}
                                                        className="accent-amber-600 w-4 h-4 rounded"
                                                    />
                                                    {range.label}
                                                </label>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
                                    {searchParam ? `Search results for "${searchParam}"` : (currentCategory?.name || 'All Products')}
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    {products.length} {products.length === 1 ? 'item' : 'items'} found
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Mobile Filter Button */}
                                <button
                                    onClick={() => setIsFilterOpen(true)}
                                    className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm"
                                >
                                    <SlidersHorizontal className="w-4 h-4" />
                                    Filters
                                </button>

                                {/* Sort Dropdown */}
                                <div className="relative" ref={sortRef}>
                                    <button
                                        onClick={() => setIsSortOpen(!isSortOpen)}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-300 shadow-sm transition-colors"
                                    >
                                        <span className="hidden sm:inline">Sort by:</span>
                                        <span className="text-gray-900">{currentSort}</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isSortOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden animate-fade-in">
                                            {sortOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => handleSort(option.value)}
                                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${sortParam === option.value ? 'text-amber-600 font-semibold bg-amber-50' : 'text-gray-700'}`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Grid Toggle - Desktop */}
                                <div className="hidden md:flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                    <button
                                        onClick={() => setGridCols(3)}
                                        className={`p-2.5 transition-colors ${gridCols === 3 ? 'bg-amber-50 text-amber-600' : 'text-gray-500 hover:bg-gray-50'}`}
                                        title="3 columns"
                                    >
                                        <Grid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setGridCols(4)}
                                        className={`p-2.5 transition-colors ${gridCols === 4 ? 'bg-amber-50 text-amber-600' : 'text-gray-500 hover:bg-gray-50'}`}
                                        title="4 columns"
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters */}
                        {categorySlug && (
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-sm text-gray-500">Active filters:</span>
                                <button
                                    onClick={() => handleCategoryFilter(null)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 text-sm font-medium rounded-full hover:bg-amber-200 transition-colors"
                                >
                                    {currentCategory?.name || categorySlug}
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}

                        {/* Products Grid */}
                        {loading ? (
                            <div className={`grid grid-cols-2 gap-4 lg:gap-6 ${gridCols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
                                        <div className="aspect-square bg-gray-200 animate-pulse"></div>
                                        <div className="p-4 space-y-2">
                                            <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                                            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-xl">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Gift className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    {!hasAnyProducts ? 'No products available' : 'No products match selected filters'}
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    {!hasAnyProducts
                                        ? 'We are currently updating our collection. Please check back later.'
                                        : 'Try adjusting your filters or search terms to find what you are looking for.'}
                                </p>
                                {hasAnyProducts && (
                                    <button
                                        onClick={() => {
                                            const params = new URLSearchParams(searchParams.toString());
                                            params.delete('category');
                                            params.delete('search');
                                            router.push(`/shop?${params.toString()}`);
                                        }}
                                        className="btn-primary"
                                    >
                                        Clear All Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className={`grid grid-cols-2 gap-4 lg:gap-6 ${gridCols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
                                {products.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            {isFilterOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsFilterOpen(false)}></div>
                    <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-xl flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                            <h2 className="text-lg font-bold text-gray-800">Filters</h2>
                            <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {/* Categories */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Categories</h3>
                                <ul className="space-y-1">
                                    <li>
                                        <button
                                            onClick={() => handleCategoryFilter(null)}
                                            className={`text-sm w-full text-left py-2.5 px-3 rounded-lg transition-colors ${!categorySlug ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            All Products
                                        </button>
                                    </li>
                                    {categories.map((cat) => (
                                        <li key={cat._id}>
                                            <button
                                                onClick={() => handleCategoryFilter(cat.slug)}
                                                className={`text-sm w-full text-left py-2.5 px-3 rounded-lg transition-colors ${categorySlug === cat.slug ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                {cat.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Price</h3>
                                <ul className="space-y-2">
                                    {[
                                        { label: 'Under ₹500', min: null, max: 500 },
                                        { label: '₹500 - ₹1000', min: 500, max: 1000 },
                                        { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
                                        { label: 'Above ₹2000', min: 2000, max: null }
                                    ].map((range) => {
                                        const isChecked = (minPriceParam || '') === (range.min?.toString() || '') &&
                                            (maxPriceParam || '') === (range.max?.toString() || '');
                                        return (
                                            <li key={range.label}>
                                                <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handlePriceFilter(range.min, range.max)}
                                                        className="accent-amber-600 w-5 h-5 rounded border-gray-300 shadow-sm"
                                                    />
                                                    {range.label}
                                                </label>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            {/* Discount */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Discount</h3>
                                <ul className="space-y-2">
                                    {[
                                        { label: '10% and above', min: 10 },
                                        { label: '20% and above', min: 20 },
                                        { label: '30% and above', min: 30 },
                                        { label: '50% and above', min: 50 }
                                    ].map((range) => {
                                        const isChecked = (minDiscountParam || '') === range.min.toString();
                                        return (
                                            <li key={range.label}>
                                                <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handleDiscountFilter(range.min)}
                                                        className="accent-amber-600 w-5 h-5 rounded border-gray-300 shadow-sm"
                                                    />
                                                    {range.label}
                                                </label>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>

                        <div className="p-4 bg-white border-t border-gray-200">
                            <button
                                onClick={() => setIsFilterOpen(false)}
                                className="btn-primary w-full"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ShopPage() {
    return (
        <>
            <Navbar />
            <Suspense fallback={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin"></div>
                </div>
            }>
                <ShopContent />
            </Suspense>
        </>
    );
}
