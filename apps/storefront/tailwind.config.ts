import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#000000",
                    foreground: "#ffffff",
                },
                secondary: {
                    DEFAULT: "#f5f5f5",
                    foreground: "#000000",
                },
                accent: {
                    DEFAULT: "#ff3e3e",
                    foreground: "#ffffff",
                },
            },
        },
    },
    plugins: [],
};
export default config;
