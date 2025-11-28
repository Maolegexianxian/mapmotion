/**
 * TailwindCSS 配置文件
 * 定义设计系统的颜色、间距、字体等
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      /**
       * 品牌颜色系统
       * 使用深邃的背景色和高饱和度的霓虹色
       */
      colors: {
        // 主品牌色 - 霓虹蓝/紫渐变基调
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // 电光蓝
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // 强调色 - 霓虹紫
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7', // 霓虹紫
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        // 背景色 - 黑曜石/深空灰
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a', // 深邃背景
          950: '#020617', // 极黑背景
        },
        // 编辑器专用色 - 基于 Catppuccin/Dracula 风格优化
        editor: {
          bg: '#09090b',       // 主背景 (极深灰)
          sidebar: '#18181b',  // 侧边栏 (深灰)
          panel: '#18181b',    // 面板背景
          surface: '#27272a',  // 浮层/卡片背景
          border: '#3f3f46',   // 边框颜色
          hover: '#3f3f46',    // 悬停背景
          active: '#52525b',   // 激活状态
          text: '#e4e4e7',     // 主文本
          muted: '#a1a1aa',    // 次要文本
        },
        // 状态色
        success: {
          500: '#10b981', // 翡翠绿
          600: '#059669',
        },
        warning: {
          500: '#f59e0b', // 琥珀黄
          600: '#d97706',
        },
        error: {
          500: '#ef4444', // 鲜红
          600: '#dc2626',
        },
      },
      
      /**
       * 字体家族
       */
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Cal Sans', 'Inter', 'sans-serif'], // 用于大标题
      },
      
      /**
       * 动画配置
       */
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-in',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(14, 165, 233, 0.5)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 30px rgba(168, 85, 247, 0.6)' },
        },
        shimmer: {
          'from': { backgroundPosition: '0 0' },
          'to': { backgroundPosition: '-200% 0' },
        },
      },
      
      /**
       * 阴影配置
       * 增加发光效果
       */
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
        'medium': '0 8px 30px -4px rgba(0, 0, 0, 0.2)',
        'strong': '0 20px 40px -8px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 20px rgba(14, 165, 233, 0.3)',
        'glow-accent': '0 0 20px rgba(168, 85, 247, 0.3)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      
      /**
       * 背景图片扩展
       */
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'grid-pattern': "linear-gradient(to right, #3f3f46 1px, transparent 1px), linear-gradient(to bottom, #3f3f46 1px, transparent 1px)",
        'dots-pattern': "radial-gradient(#3f3f46 1px, transparent 1px)",
      },
      
      /**
       * 间距扩展
       */
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      
      /**
       * Z-index 层级系统
       */
      zIndex: {
        'dropdown': '100',
        'sticky': '200',
        'modal': '300',
        'popover': '400',
        'tooltip': '500',
        'toast': '600',
      },
    },
  },
  plugins: [],
};
