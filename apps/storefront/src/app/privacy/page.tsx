'use client';

import Navbar from '@/components/Navbar';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="container-main py-12 lg:py-20">
                <div className="max-w-3xl mx-auto prose prose-amber">
                    <h1 className="text-4xl font-bold text-gray-800 mb-8 font-heading">Privacy Policy</h1>
                    <p className="text-gray-600 mb-6">Last Updated: January 2026</p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">1. Collection of Information</h2>
                    <p className="text-gray-600 mb-6">
                        We collect information when you register on our site, place an order, subscribe to our newsletter, or fill out a form. This includes your name, email address, mailing address, and phone number.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">2. Use of Information</h2>
                    <p className="text-gray-600 mb-6">
                        Any of the information we collect from you may be used to personalize your experience, improve our website, improve customer service, and process transactions.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">3. Information Protection</h2>
                    <p className="text-gray-600 mb-6">
                        We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">4. Cookies</h2>
                    <p className="text-gray-600 mb-6">
                        Yes, we use cookies to help us remember and process the items in your shopping cart and understand and save your preferences for future visits.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">5. Contacting Us</h2>
                    <p className="text-gray-600 mb-6">
                        If there are any questions regarding this privacy policy, you may contact us using the information on our contact page.
                    </p>
                </div>
            </div>
        </div>
    );
}
