'use client';

import Navbar from '@/components/Navbar';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="container-main py-12 lg:py-20">
                <div className="max-w-3xl mx-auto prose prose-amber">
                    <h1 className="text-4xl font-bold text-gray-800 mb-8 font-heading">Terms of Use</h1>
                    <p className="text-gray-600 mb-6">Last Updated: January 2026</p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">1. Agreement to Terms</h2>
                    <p className="text-gray-600 mb-6">
                        By accessing our website, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">2. Use License</h2>
                    <p className="text-gray-600 mb-6">
                        Permission is granted to temporarily download one copy of the materials on Vagmi Enterprises' website for personal, non-commercial transitory viewing only.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">3. Disclaimer</h2>
                    <p className="text-gray-600 mb-6">
                        The materials on Vagmi Enterprises' website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">4. Limitations</h2>
                    <p className="text-gray-600 mb-6">
                        In no event shall Vagmi Enterprises or its suppliers be liable for any damages arising out of the use or inability to use the materials on our website.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">5. Governing Law</h2>
                    <p className="text-gray-600 mb-6">
                        These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
                    </p>
                </div>
            </div>
        </div>
    );
}
