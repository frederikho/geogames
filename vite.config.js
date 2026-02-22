import { defineConfig } from 'vite';

export default defineConfig({
    base: '/geogames/',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: true,
    },
    server: {
        port: 5173,
        open: true,
        allowedHosts: ['71a66f24e94b.ngrok-free.app'],
    },
});
