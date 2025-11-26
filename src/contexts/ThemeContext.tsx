/**
 * 主题上下文
 * 管理应用的深色/浅色主题切换
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import type { ReactNode } from 'react';

/** 主题类型 */
export type Theme = 'light' | 'dark' | 'system';

/** 实际应用的主题（不含 system） */
export type ResolvedTheme = 'light' | 'dark';

/** 主题上下文值类型 */
interface ThemeContextValue {
  /** 当前设置的主题 */
  theme: Theme;
  /** 实际应用的主题 */
  resolvedTheme: ResolvedTheme;
  /** 设置主题 */
  setTheme: (theme: Theme) => void;
  /** 切换主题（在 light 和 dark 之间） */
  toggleTheme: () => void;
}

/** 主题存储键名 */
const THEME_STORAGE_KEY = 'mapmotion-theme';

/** 默认主题 */
const DEFAULT_THEME: Theme = 'system';

/** 主题上下文 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * 获取系统主题偏好
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * 解析主题为实际应用的主题
 */
function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

/**
 * 从存储中获取主题设置
 */
function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return DEFAULT_THEME;
}

/**
 * 应用主题到 DOM
 */
function applyThemeToDOM(resolvedTheme: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolvedTheme);
}

/** 主题提供者属性 */
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

/**
 * ThemeProvider - 主题提供者组件
 * 
 * @description
 * 提供主题状态管理和切换功能，支持：
 * - 浅色/深色/跟随系统三种模式
 * - 自动持久化到 localStorage
 * - 监听系统主题变化
 * 
 * @param props - 组件属性
 * @returns 主题提供者组件
 */
export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  // 初始化主题状态
  const [theme, setThemeState] = useState<Theme>(() => {
    return defaultTheme ?? getStoredTheme();
  });
  
  // 计算实际应用的主题
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    return resolveTheme(theme);
  });
  
  /**
   * 设置主题
   */
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }, []);
  
  /**
   * 切换主题
   */
  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  }, [resolvedTheme, setTheme]);
  
  // 监听主题变化并应用到 DOM
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyThemeToDOM(resolved);
  }, [theme]);
  
  // 监听系统主题变化
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const resolved = resolveTheme('system');
      setResolvedTheme(resolved);
      applyThemeToDOM(resolved);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  
  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme - 获取主题上下文的 Hook
 * 
 * @returns 主题上下文值
 * @throws 如果在 ThemeProvider 外部使用则抛出错误
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeProvider;
