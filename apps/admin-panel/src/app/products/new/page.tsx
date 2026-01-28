'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Image as ImageIcon,
    Upload,
    X
} from 'lucide-react';

export default function NewProductPage() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        price: '',
        category: '',
        tags: '', // Comma separated
        isActive: true,
        hoverImage: '',
        stock: ''
    });

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const [variants, setVariants] = useState<any[]>([]); // Start with no variants by default

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/products/categories');
                setCategories(res.data.categories);
            } catch (error) {
                console.error('Failed to fetch categories');
            }
        };
        fetchCategories();
    }, []);

    const handleVariantChange = (index: number, field: string, value: any) => {
        const newVariants: any = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    const addVariant = () => {
        setVariants([...variants, { size: '', color: '', stockQuantity: 0 }]);
    };

    const removeVariant = (index: number) => {
        const newVariants = variants.filter((_, i) => i !== index);
        setVariants(newVariants);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const MAX_SIZE = 20 * 1024 * 1024; // 20MB

            const oversizedFiles = files.filter(f => f.size > MAX_SIZE);
            if (oversizedFiles.length > 0) {
                alert(`Some files are too large. Maximum size is 20MB. \nOversized: ${oversizedFiles.map(f => f.name).join(', ')}`);
                return;
            }

            setSelectedFiles((prev) => [...prev, ...files]);

            const newPreviews = files.map((file) => URL.createObjectURL(file));
            setPreviews((prev) => [...prev, ...newPreviews]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Upload Images if any
            let imageUrls: string[] = [];
            if (selectedFiles.length > 0) {
                const uploadData = new FormData();
                selectedFiles.forEach((file) => uploadData.append('images', file));

                const uploadRes = await api.post('/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                imageUrls = uploadRes.data.urls;
            }

            // 2. Prepare Product Payload
            let finalVariants = [...variants];

            // If no variants are defined, create a default "Standard" one to track stock
            if (finalVariants.length === 0) {
                finalVariants = [{
                    size: 'Standard',
                    color: 'Default',
                    stockQuantity: Number(formData.stock) || 0
                }];
            }

            const productPayload = {
                ...formData,
                price: Number(formData.price),
                stock: Number(formData.stock),
                images: imageUrls,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(t => t),
                variants: finalVariants
            };

            const res = await api.post('/admin/products', productPayload);
            const productId = res.data.product._id;

            // 2. Create Variants (Backend doesn't support batch create in one go via product endpoint yet, 
            // but we can assume we might need to add them separately or update the backend to handle it.
            // For now, let's assume the backend ONLY creates the product. 
            // Wait, the backend `createProduct` just does `Product.create(req.body)`.
            // The `Product` model doesn't embed variants, they are separate documents.
            // So we need to create variants separately.

            // Actually, looking at `seed.js`, variants are created separately.
            // I need a `createVariant` endpoint or logic in `createProduct` to handle this.
            // The current `createProduct` in `adminController.js` is simple.
            // I should update `adminController.js` to handle variants creation transactionally or just loop here.
            // Let's loop here for simplicity as I didn't update the backend to handle nested variants creation.

            // Wait, I don't have a `createVariant` endpoint exposed in `adminRoutes.js`.
            // I only added `createProduct`.
            // I should probably update `adminController.js` to create variants if they are present in the body.
            // OR I can add a `createVariant` endpoint.

            // Let's update `adminController.js` to handle variants creation inside `createProduct` for better atomicity.
            // But I am in the middle of writing frontend code. 
            // I will assume I will update the backend to handle `variants` in the payload.

            // Let's send variants in the payload and I will update the backend next.

            // Wait, I can't update backend while writing this file. 
            // I will write this file assuming backend accepts `variants` array.

            // Actually, `Product` model doesn't have `variants` field (it's a virtual or separate model).
            // So `Product.create(req.body)` will ignore `variants` field if it's not in schema.
            // I MUST update the backend controller to handle this.

            // For now, I will finish this file, then update the backend controller.

        } catch (error: any) {
            console.error('Create product error:', error);
            const msg = error.response?.data?.message || error.message;
            alert(`Failed to create product: ${msg}`);
            setLoading(false);
            return;
        }

        // If successful
        router.push('/products');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-4 mb-8">
                <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-[#1e1e2d] tracking-tight">NEW PRODUCT.</h1>
                    <p className="text-gray-500">Add a new item to your inventory</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="card p-8 space-y-6">
                    <h2 className="text-xl font-bold border-b border-gray-100 pb-4">Basic Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Product Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 ring-[#1e1e2d]/10"
                                placeholder="e.g. Classic White Shirt"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Slug</label>
                            <input
                                type="text"
                                required
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 ring-[#1e1e2d]/10"
                                placeholder="e.g. classic-white-shirt"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Description</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 ring-[#1e1e2d]/10 h-32 resize-none"
                            placeholder="Product description..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Price (₹)</label>
                            <input
                                type="number"
                                required
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 ring-[#1e1e2d]/10"
                                placeholder="1999"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Category</label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 ring-[#1e1e2d]/10"
                            >
                                <option value="">Select Category</option>
                                {categories.map((c: any) => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Basic Stock (if no variants)</label>
                            <input
                                type="number"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 ring-[#1e1e2d]/10"
                                placeholder="0"
                                disabled={variants.length > 0}
                            />
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="card p-8 space-y-6">
                    <h2 className="text-xl font-bold border-b border-gray-100 pb-4">Product Images</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {previews.map((url, index) => (
                            <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-gray-100">
                                <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        {selectedFiles.length < 5 && (
                            <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-[#1e1e2d]/20 transition-all">
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-xs font-bold text-gray-500">Upload Image</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 font-medium italic">You can upload up to 5 images. JPG, PNG or WebP supported.</p>
                </div>

                {/* Variants */}
                <div className="card p-8 space-y-6">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                        <h2 className="text-xl font-bold">Variants (Optional)</h2>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="flex items-center space-x-2 text-sm font-bold text-[#1e1e2d] hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Multi-Size/Color</span>
                        </button>
                    </div>
                    {variants.length > 0 && (
                        <p className="text-xs text-amber-600 font-bold bg-amber-50 p-3 rounded-xl">
                            Note: Adding variants will override the "Basic Stock" entered above.
                        </p>
                    )}

                    <div className="space-y-4">
                        {variants.map((variant, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-50 p-4 rounded-xl">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500">Size</label>
                                    <input
                                        type="text"
                                        value={variant.size}
                                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                                        className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 outline-none focus:border-[#1e1e2d]"
                                        placeholder="e.g. XL"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500">Color</label>
                                    <input
                                        type="text"
                                        value={variant.color}
                                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                        className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 outline-none focus:border-[#1e1e2d]"
                                        placeholder="e.g. Red"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500">Stock</label>
                                    <input
                                        type="number"
                                        value={variant.stockQuantity}
                                        onChange={(e) => handleVariantChange(index, 'stockQuantity', Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 outline-none focus:border-[#1e1e2d]"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeVariant(index)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors self-end"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#1e1e2d] text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-[#1e1e2d]/20 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center space-x-3"
                    >
                        <Save className="w-5 h-5" />
                        <span>{loading ? 'Creating...' : 'Create Product'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
