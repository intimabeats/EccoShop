import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      VitePWA({ /* ... */ }),
    ],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      port: 5173,
      host: true,
      proxy: { // Adicione o proxy aqui
        '/abacatepay': {
          target: 'https://api.abacatepay.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/abacatepay/, '/v1'), // Reescreve o caminho
          secure: false, // Se a API do AbacatePay usar HTTPS (o que é provável), mantenha como true
        },
      },
    },
    define: {
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN),
      // ... outras variáveis de ambiente
    },
  };
});

