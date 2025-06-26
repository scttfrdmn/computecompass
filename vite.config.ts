import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/computecompass/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          aws: ['aws-sdk', '@aws-sdk/client-ec2', '@aws-sdk/client-pricing'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
