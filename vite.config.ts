import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    // Menggunakan './' membuat aset bersifat relatif.
    // Ini krusial agar aplikasi bisa berjalan baik di root domain (Netlify) 
    // maupun sub-path (GitHub Pages: user.github.io/repo/).
    base: './',
    define: {
      // Inject variable process.env.API_KEY agar tersedia di klien
      // Mengambil dari .env (local) atau Environment Variables Dashboard (Netlify)
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY)
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    }
  };
});