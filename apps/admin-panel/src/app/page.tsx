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
        const init = async () => {
            await checkAuth();
            if (!localStorage.getItem('admin_token')) {
                router.push('/login');
                return;
            }

            try {
                const res = await api.get('/admin/analytics');
                setStats(res.data.stats);
            } catch (error) {
                console.error('Failed to fetch analytics');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [router, checkAuth]);

    if (loading) return (
        <div className="h-[80vh] flex items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#1e1e2d]" />
        </div>
    );

    const chartData = [
        { name: 'Mon', sales: 4000 },
        { name: 'Tue', sales: 3000 },
        { name: 'Wed', sales: 2000 },
        { name: 'Thu', sales: 2780 },
        { name: 'Fri', sales: 1890 },
        { name: 'Sat', sales: 2390 },
        { name: 'Sun', sales: 3490 },
    ];

    return (
        <div className="space-y-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats?.revenue?.toLocaleString() || 0}`}
                    change="+12.5%"
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
                    value="1,204"
                    change="-2.4%"
                    isUp={false}
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
                            <option>Last 30 Days</option>
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
                        <CategoryProgress name="Men's Fashion" percentage={65} color="bg-[#1e1e2d]" />
                        <CategoryProgress name="Women's Fashion" percentage={45} color="bg-blue-500" />
                        <CategoryProgress name="Accessories" percentage={25} color="bg-purple-500" />
                        <CategoryProgress name="Footwear" percentage={15} color="bg-orange-500" />
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
