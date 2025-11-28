/**
 * Vitest 测试配置文件
 * 配置单元测试和集成测试环境
 */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/test/',
                '**/*.d.ts',
                '**/*.config.*',
                '**/types/**',
            ],
            thresholds: {
                lines: 70,
                functions: 70,
                branches: 70,
                statements: 70,
            },
        },
        // 测试超时时间
        testTimeout: 10000,
        // 钩子超时时间
        hookTimeout: 10000,
    },
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
});
