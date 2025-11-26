/**
 * 应用根组件
 * 包含路由配置、全局状态提供者、主题系统等
 */
import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { ToastProvider } from '@/components/common/Toast';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppRoutes } from '@/routes';

/**
 * App - 应用根组件
 * 
 * @description
 * 负责组装应用的顶层结构，包括：
 * - 错误边界：捕获并处理未预期的错误
 * - 主题提供者：管理深色/浅色主题切换
 * - 路由：管理页面导航
 * - Toast：全局消息提示
 * - Suspense：处理懒加载组件的加载状态
 * 
 * @returns 应用根组件
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <ToastProvider>
            <Suspense fallback={<LoadingScreen />}>
              <AppRoutes />
            </Suspense>
          </ToastProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
