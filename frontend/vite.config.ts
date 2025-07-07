import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            "/uploads": {
                target: process.env.VITE_NODE_ENV === 'prod' ? "http://209.38.138.250:3000" : "http://localhost:3000",
                changeOrigin: true,
                secure: false,
            },
            "/market": {
                target: process.env.VITE_NODE_ENV === 'prod' ? "http://209.38.138.250:3000" : "http://localhost:3000",
                changeOrigin: true,
                secure: false,
            },
            '/places': {
                target: process.env.VITE_NODE_ENV === 'prod' ? "http://209.38.138.250:3000" : "http://localhost:3000",
                changeOrigin: true,
                secure: false,
            },
        }
    }
});
