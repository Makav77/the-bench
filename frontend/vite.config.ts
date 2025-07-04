import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            "/uploads": {
                target: "http://localhost:3000",
                changeOrigin: true,
                secure: false,
            },
            "/market": {
                target: "http://localhost:3000",
                changeOrigin: true,
                secure: false,
            },
            '/places': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
            },
        }
    }
});
