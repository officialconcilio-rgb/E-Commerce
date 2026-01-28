import type { Metadata } from "next";
import { Inter, Outfit, Playfair_Display, Great_Vibes, Dancing_Script, Parisienne, Monsieur_La_Doulaise, Mrs_Saint_Delafield, Pinyon_Script, Niconne, Allura } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });
const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"], variable: '--font-great-vibes' });
const dancingScript = Dancing_Script({ weight: ["400", "700"], subsets: ["latin"], variable: '--font-dancing' });
const parisienne = Parisienne({ weight: "400", subsets: ["latin"], variable: '--font-parisienne' });
const monsieurLaDoulaise = Monsieur_La_Doulaise({ weight: "400", subsets: ["latin"], variable: '--font-monsieur' });
const mrsSaintDelafield = Mrs_Saint_Delafield({ weight: "400", subsets: ["latin"], variable: '--font-mrs-saint' });
const pinyonScript = Pinyon_Script({ weight: "400", subsets: ["latin"], variable: '--font-pinyon' });
const niconne = Niconne({ weight: "400", subsets: ["latin"], variable: '--font-niconne' });
const allura = Allura({ weight: "400", subsets: ["latin"], variable: '--font-allura' });

export const metadata: Metadata = {
    title: "Vagmi Enterprises | Gifts of Tradition",
    description: "Trusted destination for quality gift items reflecting culture, tradition, and boundless emotions.",
    keywords: "gifts, tradition, culture, festivals, premium gifts, vagmi enterprises, gift items",
};

import Footer from "@/components/Footer";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable} ${playfair.variable} ${greatVibes.variable} ${dancingScript.variable} ${parisienne.variable} ${monsieurLaDoulaise.variable} ${mrsSaintDelafield.variable} ${pinyonScript.variable} ${niconne.variable} ${allura.variable}`}>
            <body className="font-inter">
                {children}
                <Footer />
            </body>
        </html>
    );
}
