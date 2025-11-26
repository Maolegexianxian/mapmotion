/**
 * 错误边界组件
 * 捕获子组件树中的 JavaScript 错误，显示备用 UI
 */
import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

import type { ErrorInfo, ReactNode } from 'react';

/** 错误边界属性 */
interface ErrorBoundaryProps {
  /** 子组件 */
  children: ReactNode;
  /** 自定义错误回退组件 */
  fallback?: ReactNode;
  /** 错误回调函数 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/** 错误边界状态 */
interface ErrorBoundaryState {
  /** 是否有错误 */
  hasError: boolean;
  /** 错误对象 */
  error: Error | null;
  /** 错误信息 */
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - 错误边界组件
 * 
 * @description
 * React 错误边界组件，用于：
 * - 捕获渲染过程中的错误
 * - 显示友好的错误提示界面
 * - 提供重试功能
 * - 上报错误到监控系统
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }
  
  /**
   * 从错误中派生状态
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }
  
  /**
   * 捕获错误信息
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // 调用错误回调
    this.props.onError?.(error, errorInfo);
    
    // 记录错误到控制台
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }
  
  /**
   * 重置错误状态
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };
  
  /**
   * 刷新页面
   */
  handleRefresh = (): void => {
    window.location.reload();
  };
  
  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;
    
    if (hasError) {
      // 如果提供了自定义回退组件，使用它
      if (fallback) {
        return fallback;
      }
      
      // 默认错误 UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-slate-800">
            {/* 错误图标 */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-100 dark:bg-error-900/30">
                <AlertTriangle className="h-8 w-8 text-error-600 dark:text-error-400" />
              </div>
            </div>
            
            {/* 错误标题 */}
            <h1 className="mb-2 text-center text-xl font-semibold text-slate-900 dark:text-slate-100">
              出现了一些问题
            </h1>
            
            {/* 错误描述 */}
            <p className="mb-6 text-center text-sm text-slate-600 dark:text-slate-400">
              应用程序遇到了意外错误。请尝试刷新页面或稍后再试。
            </p>
            
            {/* 错误详情（开发环境显示） */}
            {import.meta.env.DEV && error && (
              <div className="mb-6 rounded-lg bg-slate-100 p-4 dark:bg-slate-700">
                <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  错误详情
                </p>
                <pre className="overflow-auto text-xs text-error-600 dark:text-error-400">
                  {error.message}
                </pre>
              </div>
            )}
            
            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="btn-secondary flex-1"
              >
                重试
              </button>
              <button
                onClick={this.handleRefresh}
                className="btn-primary flex-1"
              >
                <RefreshCw className="h-4 w-4" />
                刷新页面
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return children;
  }
}

export default ErrorBoundary;
