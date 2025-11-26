/**
 * 国际化配置模块
 * 使用 i18next 实现多语言支持
 */
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { zhCN } from './zh-CN';
import { enUS } from './en-US';

/**
 * 支持的语言列表
 */
export const SUPPORTED_LANGUAGES = {
  'zh-CN': '简体中文',
  'en-US': 'English',
} as const;

/**
 * 语言代码类型
 */
export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

/**
 * 默认语言
 */
export const DEFAULT_LANGUAGE: LanguageCode = 'zh-CN';

/**
 * 语言资源配置
 * 包含所有支持语言的翻译文本
 */
const resources = {
  'zh-CN': {
    translation: zhCN,
  },
  'en-US': {
    translation: enUS,
  },
};

/**
 * 初始化国际化模块
 * 
 * @description
 * 配置 i18next 实例，包括：
 * - 语言检测器：自动检测用户首选语言
 * - React 集成：支持 React 组件中使用翻译
 * - 回退语言：当翻译缺失时使用默认语言
 * - 插值：支持动态变量替换
 */
export function initializeI18n() {
  i18n
    // 使用语言检测器
    .use(LanguageDetector)
    // 使用 React 集成
    .use(initReactI18next)
    // 初始化配置
    .init({
      // 语言资源
      resources,
      // 默认语言
      fallbackLng: DEFAULT_LANGUAGE,
      // 支持的语言列表
      supportedLngs: Object.keys(SUPPORTED_LANGUAGES),
      // 调试模式（仅开发环境）
      debug: import.meta.env.DEV,
      // 插值配置
      interpolation: {
        // React 已经处理了 XSS，无需转义
        escapeValue: false,
      },
      // 语言检测配置
      detection: {
        // 检测顺序：localStorage > navigator > htmlTag
        order: ['localStorage', 'navigator', 'htmlTag'],
        // 缓存到 localStorage
        caches: ['localStorage'],
        // localStorage 的键名
        lookupLocalStorage: 'mapmotion-language',
      },
      // React 配置
      react: {
        // 使用 Suspense
        useSuspense: true,
      },
    });
  
  return i18n;
}

/**
 * 切换语言
 * 
 * @param language - 目标语言代码
 */
export function changeLanguage(language: LanguageCode): Promise<void> {
  return i18n.changeLanguage(language) as Promise<void>;
}

/**
 * 获取当前语言
 * 
 * @returns 当前语言代码
 */
export function getCurrentLanguage(): LanguageCode {
  return (i18n.language as LanguageCode) || DEFAULT_LANGUAGE;
}

export default i18n;
