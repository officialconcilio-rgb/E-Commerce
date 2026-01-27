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
    X,
    Loader2
} from 'lucide-react';

export default function EditProductPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const productId = params.id;

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        price: '',
        category: '',
        tags: '',
        isActive: true,
        hoverImage: '',
        stock: ''
    });

    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const [variants, setVariants] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, categoriesRes] = await Promise.all([
                    api.get(`/admin/products/${productId}`),
                    api.get('/products/categories')
                ]);

                const product = productRes.data.product;
                setFormData({
                    name: product.name,
                    slug: product.slug,
                    description: product.description,
                    price: product.price.toString(),
                    category: product.category?._id || product.category || '',
                    tags: product.tags.join(', '),
                    isActive: product.isActive,
                    hoverImage: product.hoverImage || '',
                    stock: product.stock?.toString() || '0'
                });
                setExistingImages(product.images || []);
                setVariants(productRes.data.variants || []);
                setCategories(categoriesRes.data.categories);
            } catch (error) {
                console.error('Failed to fetch data');
                alert('Failed to load product details');
                router.push('/products');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [productId, router]);

    const handleVariantChange = (index: number, field: string, value: any) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    const addVariant = () => {
        setVariants([...variants, { size: '', color: '', stockQuantity: 0 }]);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
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

    const removeNewFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index: number) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // 1. Upload New Images if any
            let newImageUrls: string[] = [];
            if (selectedFiles.length > 0) {
                const uploadData = new FormData();
                selectedFiles.forEach((file) => uploadData.append('images', file));

                const uploadRes = await api.post('/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                newImageUrls = uploadRes.data.urls;
            }

            // Prepare Payload
            let finalVariants = [...variants];

            // If no variants are defined or available, create a default "Standard" one to track stock
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
                images: [...existingImages, ...newImageUrls],
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(t => t),
                variants: finalVariants
            };

            await api.put(`/admin/products/${productId}`, productPayload);
            alert('Product updated successfully');
            router.push('/products');
        } catch (error: any) {
            console.error('Update product error:', error);
            const msg = error.response?.data?.message || error.message;
            alert(`Failed to update product: ${msg}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-[#1e1e2d] opacity-20" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-4 mb-8">
                <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-[#1e1e2d] tracking-tight uppercase">EDIT PRODUCT.</h1>
                    <p className="text-gray-500">Update product details and inventory</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 pb-20">
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

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Tags (comma separated)</label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 ring-[#1e1e2d]/10"
                            placeholder="e.g. traditional, copper, handmade"
                        />
                    </div>

                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-5 h-5 accent-[#1e1e2d]"
                        />
                        <label htmlFor="isActive" className="text-sm font-bold text-gray-700 cursor-pointer">Product is Active (visible on store)</label>
                    </div>
                </div>

                {/* Images */}
                <div className="card p-8 space-y-6">
                    <h2 className="text-xl font-bold border-b border-gray-100 pb-4">Product Images</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Existing Images */}
                        {existingImages.map((url, index) => (
                            <div key={`existing-${index}`} className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-gray-100">
                                <img src={url} alt="Product" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(index)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] py-1 text-center opacity-70">Existing</div>
                            </div>
                        ))}

                        {/* New Previews */}
                        {previews.map((url, index) => (
                            <div key={`new-${index}`} className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-[#1e1e2d]/10">
                                <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeNewFile(index)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-[#1e1e2d]/80 text-white text-[10px] py-1 text-center">New</div>
                            </div>
                        ))}

                        {(existingImages.length + selectedFiles.length) < 5 && (
                            <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-[#1e1e2d]/20 transition-all">
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-xs font-bold text-gray-500">Add More Images</span>
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
                </div>

                {/* Variants */}
                <div className="card p-8 space-y-6">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                        <h2 className="text-xl font-bold">Variants & Stock (Optional)</h2>
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
                        {variants.length === 0 && (
                            <p className="text-center py-8 text-gray-400 italic">No variants defined. Add one to track stock.</p>
                        )}
                        {variants.map((variant, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-50 p-4 rounded-xl">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500">Size</label>
                                    <input
                                        type="text"
                                        value={variant.size}
                                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                                        className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 focus:border-[#1e1e2d] outline-none"
                                        placeholder="e.g. XL"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500">Color</label>
                                    <input
                                        type="text"
                                        value={variant.color}
                                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                        className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 focus:border-[#1e1e2d] outline-none"
                                        placeholder="e.g. Red"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500">Stock</label>
                                    <input
                                        type="number"
                                        value={variant.stockQuantity}
                                        onChange={(e) => handleVariantChange(index, 'stockQuantity', Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 focus:border-[#1e1e2d] outline-none"
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
                        disabled={saving}
                        className="bg-[#1e1e2d] text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-[#1e1e2d]/20 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center space-x-3"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Updating...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
