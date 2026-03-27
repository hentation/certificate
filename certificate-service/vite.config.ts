import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import qiankun from 'vite-plugin-qiankun-lite';
import path from 'path';
import packageJson from './package.json';

export default defineConfig({
  plugins: [
    qiankun({ name: 'certificate-service', sandbox: true }),
    react(),
  ],
  server: {
    port: 8080,
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src')
    }
  },
  define: {
    'process.env.PROJECT_NAME': JSON.stringify(packageJson.name)
  }
});