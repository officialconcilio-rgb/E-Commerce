import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const metadata: Metadata = {
    title: "BRAND. | Premium Clothing & Lifestyle",
    description: "Discover the latest in premium fashion. High-quality pieces designed for the modern lifestyle.",
    keywords: "fashion, clothing, premium, luxury, streetwear",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
            <body className="font-inter">
                <main className="min-h-screen">
                    {children}
                </main>
                <footer className="bg-black text-white py-24 mt-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                            <div className="col-span-1 md:col-span-2">
                                <h2 className="text-3xl font-black tracking-tighter mb-6">BRAND.</h2>
                                <p className="text-gray-400 max-w-sm mb-8">
                                    Redefining modern fashion with a focus on quality, sustainability, and timeless design.
                                </p>
                                <div className="flex space-x-6">
                                    {/* Social Icons */}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold mb-6 uppercase tracking-widest text-sm">Shop</h3>
                                <ul className="space-y-4 text-gray-400 text-sm">
                                    <li><a href="/shop?category=men" className="hover:text-white transition-colors">Men's Collection</a></li>
                                    <li><a href="/shop?category=women" className="hover:text-white transition-colors">Women's Collection</a></li>
                                    <li><a href="/shop" className="hover:text-white transition-colors">All Products</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold mb-6 uppercase tracking-widest text-sm">Support</h3>
                                <ul className="space-y-4 text-gray-400 text-sm">
                                    <li><a href="#" className="hover:text-white transition-colors">Shipping Policy</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Returns & Exchanges</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 mt-24 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 space-y-4 md:space-y-0">
                            <p>© 2024 BRAND. All rights reserved.</p>
                            <div className="flex space-x-8">
                                <a href="#" className="hover:text-white">Privacy Policy</a>
                                <a href="#" className="hover:text-white">Terms of Service</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </body>
        </html>
    );
}
