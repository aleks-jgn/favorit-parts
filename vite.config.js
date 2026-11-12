import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Боевой хост web-сервиса. Приложение обращается к нему через относительный путь /api,
// поэтому браузер видит только свой домен: не нужен CORS и нет проблем с mixed content.
const DEFAULT_API_TARGET = 'https://api.favorit-parts.ru';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxy = {
    '/api': {
      target: env.API_PROXY_TARGET || DEFAULT_API_TARGET,
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  };

  return {
    plugins: [react()],
    server: { proxy },
    preview: { proxy },
    test: {
      environment: 'node',
      include: ['src/**/*.test.js'],
      setupFiles: ['./src/test/setup.js'],
    },
  };
});
