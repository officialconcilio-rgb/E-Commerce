'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Save, Truck, RotateCcw, DollarSign } from 'lucide-react';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        freeShippingThreshold: 5000,
        shippingCost: 150,
        returnPeriodDays: 30
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            if (res.data.success) {
                setSettings(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put('/settings', settings);
            if (res.data.success) {
                alert('Settings updated successfully!');
                setSettings(res.data.data);
            }
        } catch (error) {
            console.error('Failed to update settings:', error);
            alert('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">STORE SETTINGS.</h1>
                    <p className="text-gray-500">Manage global store configurations</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Shipping Settings */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                            <Truck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Shipping Configuration</h2>
                            <p className="text-sm text-gray-500">Set shipping costs and free shipping thresholds</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-bold uppercase tracking-wider mb-3 text-gray-500">
                                Free Shipping Threshold (₹)
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    value={settings.freeShippingThreshold}
                                    onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-black focus:outline-none transition-all font-bold"
                                    min="0"
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-400">Orders above this amount will have free shipping</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase tracking-wider mb-3 text-gray-500">
                                Standard Shipping Cost (₹)
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    value={settings.shippingCost}
                                    onChange={(e) => setSettings({ ...settings, shippingCost: Number(e.target.value) })}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-black focus:outline-none transition-all font-bold"
                                    min="0"
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-400">Applied to orders below the threshold</p>
                        </div>
                    </div>
                </div>

                {/* Return Policy Settings */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-purple-50 p-3 rounded-2xl text-purple-600">
                            <RotateCcw className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Return Policy</h2>
                            <p className="text-sm text-gray-500">Configure return window duration</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold uppercase tracking-wider mb-3 text-gray-500">
                            Return Period (Days)
                        </label>
                        <input
                            type="number"
                            value={settings.returnPeriodDays}
                            onChange={(e) => setSettings({ ...settings, returnPeriodDays: Number(e.target.value) })}
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-black focus:outline-none transition-all font-bold"
                            min="0"
                        />
                        <p className="mt-2 text-xs text-gray-400">Number of days customers have to return items</p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center space-x-2 bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
