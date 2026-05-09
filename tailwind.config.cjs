/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#800020', // Crimson
                    dark: '#5a0016',
                    soft: '#fdf2f4',
                    hover: '#9c0027',
                },
                surface: '#ffffff',
                border: {
                    DEFAULT: '#e2e8f0', // slate-200
                    focus: '#800020',
                },
                danger: {
                    DEFAULT: '#ef4444',
                    soft: '#fef2f2',
                },
                success: {
                    DEFAULT: '#10b981',
                    soft: '#ecfdf5',
                },
                slate: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
                '4xl': '2rem',
            },
            boxShadow: {
                'premium': '0 10px 30px rgba(0, 0, 0, 0.05), 0 1px 1px rgba(0, 0, 0, 0.01)',
                'premium-hover': '0 20px 40px rgba(128, 0, 32, 0.1), 0 1px 2px rgba(128, 0, 32, 0.05)',
            }
        },
    },
    plugins: [],
}
