/**
 * Vite 构建配置文件
 * 配置 React + TypeScript 项目的构建选项
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  /**
   * 路径别名配置
   * 使用 @ 作为 src 目录的别名，简化导入路径
   */
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@stores': resolve(__dirname, './src/stores'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
      '@services': resolve(__dirname, './src/services'),
      '@assets': resolve(__dirname, './src/assets'),
      '@locales': resolve(__dirname, './src/locales'),
      '@constants': resolve(__dirname, './src/constants'),
      '@engines': resolve(__dirname, './src/engines'),
    },
  },
  
  /**
   * 开发服务器配置
   */
  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true,
  },
  
  /**
   * 预览服务器配置
   */
  preview: {
    port: 4173,
    host: true,
  },
  
  /**
   * 构建优化配置
   */
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        /**
         * 代码分割策略
         * 将大型依赖拆分为单独的 chunk
         */
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-map': ['maplibre-gl', 'react-map-gl'],
          'vendor-deck': ['@deck.gl/core', '@deck.gl/layers', '@deck.gl/geo-layers', '@deck.gl/mapbox'],
          'vendor-turf': ['@turf/turf'],
          'vendor-ui': ['framer-motion', 'lucide-react'],
          'vendor-state': ['zustand', 'immer'],
          'vendor-i18n': ['i18next', 'react-i18next'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  
  /**
   * 依赖优化配置
   */
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'maplibre-gl',
      'zustand',
      'i18next',
      'react-i18next',
      'lodash-es',
    ],
  },
  
  /**
   * CSS 配置
   */
  css: {
    devSourcemap: true,
  },
});
