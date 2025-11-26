/// <reference types="vite/client" />

/**
 * Vite 环境变量类型声明
 */
interface ImportMetaEnv {
  /** 应用标题 */
  readonly VITE_APP_TITLE: string;
  /** API 基础 URL */
  readonly VITE_API_BASE_URL: string;
  /** MapLibre 样式 URL */
  readonly VITE_MAP_STYLE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
