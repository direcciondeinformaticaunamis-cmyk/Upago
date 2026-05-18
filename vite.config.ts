import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/',
    plugins: [
        react()
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
