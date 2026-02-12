import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // 🔥 CRITICAL: Base path DEVE ser './' para file:// protocol do Electron
      base: './',
      
      server: {
        port: 5173,
        host: '0.0.0.0',
      },
      
      plugins: [react()],
      
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      },
      
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      
      build: {
        outDir: 'dist',
        emptyOutDir: true,
        // 🔥 CRITICAL: sourcemap true para debug em produção (remover depois)
        sourcemap: true,
        minify: 'esbuild',
        // 🔥 CRITICAL: Formato de assets consistente
        assetsDir: 'assets',
        rollupOptions: {
          output: {
            // Nomes consistentes para facilitar debug
            entryFileNames: 'assets/[name]-[hash].js',
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash][extname]',
            manualChunks(id) {
              if (id.includes('three') || id.includes('@react-three')) {
                return 'three-vendor';
              }
              if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
                return 'react-vendor';
              }
              if (id.includes('lucide-react')) {
                return 'icons';
              }
            },
          },
        },
      },
    };
});
