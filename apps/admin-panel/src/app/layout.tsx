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
    ShieldCheck,
    Loader2
} from 'lucide-react';
import NotificationCenter from '@/components/NotificationCenter';
import { useAdminStore } from '@/store/useAdminStore';
import { useEffect, useState } from 'react';

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
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    const isLoginPage = pathname === '/login';

    useEffect(() => {
        // Skip auth check for login page
        if (isLoginPage) {
            setIsLoading(false);
            return;
        }

        // Check authentication
        const token = sessionStorage.getItem('admin_token');

        if (!token && !isAuthenticated) {
            // No token and not authenticated - redirect to login
            router.replace('/login');
            return;
        }

        if (token || isAuthenticated) {
            // User has token or is authenticated - allow access
            setIsAuthorized(true);
            setIsLoading(false);
        }
    }, [isAuthenticated, isLoginPage, router]);

    // Login page - render without sidebar
    if (isLoginPage) {
        return (
            <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
                <body className="font-inter">{children}</body>
            </html>
        );
    }

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
                <body className="font-inter flex h-screen items-center justify-center bg-[#1e1e2d]">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
                        <p className="text-white/60 text-sm">Loading...</p>
                    </div>
                </body>
            </html>
        );
    }

    // Not authorized - don't render anything (redirect is in progress)
    if (!isAuthorized) {
        return (
            <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
                <body className="font-inter flex h-screen items-center justify-center bg-[#1e1e2d]">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
                        <p className="text-white/60 text-sm">Redirecting to login...</p>
                    </div>
                </body>
            </html>
        );
    }

    const navItems = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        {
            name: 'Categories', href: '/categories', icon: ({ className }: { className?: string }) => (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
            )
        },
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
                        <h1 className="text-3xl font-script text-white" style={{ fontFamily: "'Great Vibes', cursive" }}>Vagmi</h1>
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
                            <NotificationCenter />

                            <div className="flex items-center space-x-4 pl-6 border-l border-gray-100">
                                <div className="text-right">
                                    <p className="text-sm font-black text-[#1e1e2d]">{admin?.username || admin?.firstName || 'Admin User'}</p>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{admin?.role || 'Manager'}</p>
                                </div>
                                <div className="w-12 h-12 bg-[#1e1e2d] rounded-2xl flex items-center justify-center text-white font-black">
                                    {(admin?.username || admin?.firstName)?.[0]?.toUpperCase() || 'A'}
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
