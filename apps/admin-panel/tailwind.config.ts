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
                admin: {
                    sidebar: "#1e1e2d",
                    header: "#ffffff",
                    background: "#f4f5f8",
                    primary: "#009ef7",
                },
            },
        },
    },
    plugins: [],
};
export default config;
