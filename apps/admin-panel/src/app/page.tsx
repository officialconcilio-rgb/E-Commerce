'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAdminStore } from '@/store/useAdminStore';
import { useRouter } from 'next/navigation';
import {
    TrendingUp,
    ShoppingBag,
    Users,
    Package,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

export default function Dashboard() {
    const router = useRouter();
    const { isAuthenticated, checkAuth } = useAdminStore();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Safety timeout to prevent infinite loading - redirect to login after 5 seconds
        const timeoutId = setTimeout(() => {
            if (mounted && loading) {
                setLoading(false);
                const token = sessionStorage.getItem('admin_token');
                if (!token) {
                    router.replace('/login');
                }
            }
        }, 5000);

        const init = async () => {
            // If already authenticated, just fetch stats
            if (isAuthenticated) {
                try {
                    const res = await api.get('/admin/analytics');
                    if (mounted) setStats(res.data.stats);
                } catch (error: any) {
                    console.error('Failed to fetch analytics');
                    // If 401, redirect to login
                    if (error.response?.status === 401) {
                        useAdminStore.getState().logout();
                        router.replace('/login');
                        return;
                    }
                } finally {
                    if (mounted) setLoading(false);
                }
                return;
            }

            // If not authenticated, try to restore session
            await checkAuth();
            const token = sessionStorage.getItem('admin_token');

            if (!token) {
                router.replace('/login');
                return;
            }

            try {
                const res = await api.get('/admin/analytics');
                if (mounted) setStats(res.data.stats);
            } catch (error: any) {
                console.error('Failed to fetch analytics');
                if (error.response?.status === 401) {
                    useAdminStore.getState().logout();
                    router.replace('/login');
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };
        init();

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
        };
    }, [router, checkAuth, isAuthenticated, loading]);

    if (loading) return (
        <div className="h-[80vh] flex items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#1e1e2d]" />
        </div>
    );

    const chartData = stats?.salesChart || [];

    const categoryColors = [
        "bg-[#1e1e2d]",
        "bg-blue-500",
        "bg-purple-500",
        "bg-orange-500"
    ];

    return (
        <div className="space-y-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats?.revenue?.toLocaleString() || 0}`}
                    change="+12.5%" // Ideally this should also be dynamic
                    isUp={true}
                    icon={TrendingUp}
                />
                <StatCard
                    title="Total Orders"
                    value={stats?.orders || 0}
                    change="+8.2%"
                    isUp={true}
                    icon={ShoppingBag}
                />
                <StatCard
                    title="Total Products"
                    value={stats?.products || 0}
                    change="Steady"
                    isUp={true}
                    icon={Package}
                />
                <StatCard
                    title="Active Users"
                    value={stats?.users?.toLocaleString() || 0}
                    change="+2.4%"
                    isUp={true}
                    icon={Users}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 card p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold">Sales Overview</h2>
                        <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-bold outline-none">
                            <option>Last 7 Days</option>
                        </select>
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1e1e2d" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#1e1e2d" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#1e1e2d"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card p-8 flex flex-col">
                    <h2 className="text-xl font-bold mb-8">Top Categories</h2>
                    <div className="space-y-6 flex-1">
                        {stats?.topCategories?.length > 0 ? (
                            stats.topCategories.map((cat: any, index: number) => (
                                <CategoryProgress
                                    key={index}
                                    name={cat.name}
                                    percentage={cat.percentage}
                                    color={categoryColors[index % categoryColors.length]}
                                />
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">No sales data yet.</p>
                        )}
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <button className="w-full py-4 text-sm font-bold text-gray-500 hover:text-[#1e1e2d] transition-colors">
                            View All Analytics
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, isUp, icon: Icon }: any) {
    return (
        <div className="card p-8 hover:scale-[1.02] transition-transform cursor-pointer">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-gray-50 p-3 rounded-2xl">
                    <Icon className="w-6 h-6 text-[#1e1e2d]" />
                </div>
                <div className={`flex items-center space-x-1 text-xs font-bold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                    <span>{change}</span>
                    {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-black text-[#1e1e2d]">{value}</p>
        </div>
    );
}

function CategoryProgress({ name, percentage, color }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold">
                <span>{name}</span>
                <span>{percentage}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-1000`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}
