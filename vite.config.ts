import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    // PENTING: Menggunakan './' membuat semua link aset (JS/CSS) bersifat relatif terhadap file HTML.
    // Ini memungkinkan aplikasi berjalan di:
    // 1. Netlify (https://domain-anda.com/)
    // 2. GitHub Pages (https://user.github.io/nama-repo/)
    base: './',
    define: {
      // Inject API Key dari Environment Variables ke dalam kode klien saat build
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY)
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      // Pastikan direktori output bersih sebelum build
      emptyOutDir: true,
    }
  };
});