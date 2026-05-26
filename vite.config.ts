import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';

function copyPublicAssets() {
  return {
    name: 'copy-public-assets',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist');
      const publicDir = resolve(__dirname, 'public');

      // Copy manifest.json
      if (existsSync(resolve(publicDir, 'manifest.json'))) {
        if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });
        copyFileSync(
          resolve(publicDir, 'manifest.json'),
          resolve(distDir, 'manifest.json')
        );
      }

      // Copy icons
      const iconsSource = resolve(publicDir, 'icons');
      const iconsDest = resolve(distDir, 'icons');
      if (existsSync(iconsSource)) {
        if (!existsSync(iconsDest)) mkdirSync(iconsDest, { recursive: true });
        readdirSync(iconsSource).forEach((file) => {
          copyFileSync(resolve(iconsSource, file), resolve(iconsDest, file));
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), copyPublicAssets()],
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
      '@popup': resolve(__dirname, 'src/popup'),
      '@options': resolve(__dirname, 'src/options'),
      '@content': resolve(__dirname, 'src/content'),
      '@background': resolve(__dirname, 'src/background'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        options: resolve(__dirname, 'options.html'),
        background: resolve(__dirname, 'src/background/serviceWorker.ts'),
        content: resolve(__dirname, 'src/content/scanner.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') return 'background/serviceWorker.js';
          if (chunkInfo.name === 'content') return 'content/scanner.js';
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
