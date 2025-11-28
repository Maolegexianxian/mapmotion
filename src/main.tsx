/**
 * 应用入口文件
 * 初始化 React 应用、国际化、状态管理等核心模块
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';

import App from './App';
import { initializeI18n } from './locales/i18n';

import './styles/index.css';

/**
 * 初始化国际化模块
 * 必须在渲染应用之前完成
 */
initializeI18n();

/**
 * 获取根 DOM 节点
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('找不到根节点 #root，请检查 index.html');
}

/**
 * 创建 React 根节点并渲染应用
 * 使用 StrictMode 进行开发时的额外检查
 */
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
