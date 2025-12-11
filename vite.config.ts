import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Gunakan '.' sebagai path, lebih aman daripada process.cwd() untuk menghindari isu tipe
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    // PENTING: Gunakan './' agar path aset bersifat relatif.
    // Ini memungkinkan aplikasi berjalan di sub-folder (GitHub Pages) maupun root (Netlify).
    base: './',
    define: {
      // Mengganti 'process.env.API_KEY' di kode dengan nilai string sebenarnya saat build
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY)
    }
  };
});