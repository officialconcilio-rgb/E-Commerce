'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    ExternalLink,
    MoreVertical,
    Filter
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/products');
                setProducts(res.data.products);
            } catch (error) {
                console.error('Failed to fetch products');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter((p: any) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#1e1e2d] tracking-tight mb-2">PRODUCTS.</h1>
                    <p className="text-gray-500">Manage your inventory and product catalog</p>
                </div>
                <Link href="/products/new" className="bg-[#1e1e2d] text-white px-8 py-4 rounded-2xl font-bold flex items-center space-x-3 shadow-xl shadow-[#1e1e2d]/20 hover:scale-[1.02] transition-all">
                    <Plus className="w-5 h-5" />
                    <span>Add New Product</span>
                </Link>
            </div>

            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-[#1e1e2d]/10 transition-all"
                        />
                    </div>
                    <button className="px-6 py-4 bg-gray-50 rounded-2xl font-bold flex items-center space-x-2 hover:bg-gray-100 transition-all">
                        <Filter className="w-5 h-5" />
                        <span>Filters</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                                <th className="px-6 pb-4">Product</th>
                                <th className="px-6 pb-4">Category</th>
                                <th className="px-6 pb-4">Price</th>
                                <th className="px-6 pb-4">Stock</th>
                                <th className="px-6 pb-4">Status</th>
                                <th className="px-6 pb-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-6"><div className="h-12 w-12 bg-gray-100 rounded-xl"></div></td>
                                        <td colSpan={5} className="px-6 py-6"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredProducts.map((product: any) => (
                                <tr key={product._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-gray-100">
                                                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#1e1e2d]">{product.name}</p>
                                                <p className="text-xs text-gray-400 font-mono">{product.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                                            {product.category?.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 font-bold">₹{product.basePrice}</td>
                                    <td className="px-6 py-6">
                                        <span className="font-medium">124 units</span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                            {product.isActive ? 'Active' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400 hover:text-[#1e1e2d]">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400 hover:text-blue-500">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
