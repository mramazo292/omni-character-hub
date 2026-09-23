import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import express from 'express';
import { apiRouter } from './src/server/apiRouter.ts';

const apiApp = express();
apiApp.use(express.json());
apiApp.use('/api', apiRouter);

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    {
      name: 'api-server-middleware',
      configureServer(server) {
        server.middlewares.use(apiApp);
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
});
