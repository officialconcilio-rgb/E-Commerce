'use client';

import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    Settings,
    LogOut,
    Bell,
    Search,
    ShieldCheck
} from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import { useEffect } from 'react';

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { admin, logout, isAuthenticated } = useAdminStore();

    const isLoginPage = pathname === '/login';

    if (isLoginPage) {
        return (
            <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
                <body className="font-inter">{children}</body>
            </html>
        );
    }

    const navItems = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Products', href: '/products', icon: Package },
        { name: 'Orders', href: '/orders', icon: ShoppingBag },
        { name: 'Customers', href: '/customers', icon: Users },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
            <body className="font-inter flex h-screen overflow-hidden bg-[#f4f7fe]">
                {/* Sidebar */}
                <aside className="w-80 bg-[#1e1e2d] text-white flex flex-col p-8 shrink-0">
                    <div className="flex items-center space-x-4 mb-12 px-2">
                        <div className="bg-white/10 p-3 rounded-2xl">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tighter">ADMIN.</h1>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="pt-8 border-t border-white/10">
                        <button
                            onClick={() => { logout(); router.push('/login'); }}
                            className="sidebar-link sidebar-link-inactive w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <header className="h-24 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-12 shrink-0">
                        <div className="relative w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search anything..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-[#1e1e2d]/5 transition-all"
                            />
                        </div>

                        <div className="flex items-center space-x-6">
                            <button className="relative p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                                <Bell className="w-6 h-6 text-gray-500" />
                                <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>

                            <div className="flex items-center space-x-4 pl-6 border-l border-gray-100">
                                <div className="text-right">
                                    <p className="text-sm font-black text-[#1e1e2d]">{admin?.username || 'Admin User'}</p>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{admin?.role || 'Manager'}</p>
                                </div>
                                <div className="w-12 h-12 bg-[#1e1e2d] rounded-2xl flex items-center justify-center text-white font-black">
                                    {admin?.username?.[0].toUpperCase() || 'A'}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                        {children}
                    </div>
                </main>
            </body>
        </html>
    );
}
