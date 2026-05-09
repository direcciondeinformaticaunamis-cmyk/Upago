import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
            manifest: {
                name: 'Portal de Admisión UNAMIS',
                short_name: 'MiUNAMIS',
                description: 'Sistema de gestión de admisiones UNAMIS',
                theme_color: '#800020',
                background_color: '#ffffff',
                display: 'standalone',
                scope: '/',
                start_url: '/',
                orientation: 'portrait',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    }
                ]
            }
        })
    ],
    css: {
        postcss: './postcss.config.cjs',
    },
    server: {
        proxy: {
            // Forward PHP requests to local PHP server
            '^/.*\\.php': {
                target: 'http://localhost:8001',
                changeOrigin: true,
            },
            // Forward uploads
            '^/uploads/.*': {
                target: 'http://localhost:8001',
                changeOrigin: true,
            }
        }
    }
})
