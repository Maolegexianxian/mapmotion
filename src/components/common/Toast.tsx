/**
 * Toast 消息提示组件
 * 提供全局的消息通知功能
 */
import { createContext, useCallback, useContext, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { nanoid } from 'nanoid';

import type { ReactNode } from 'react';

/** Toast 类型 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/** Toast 数据 */
export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

/** Toast 上下文值 */
interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
}

/** 默认显示时长 */
const DEFAULT_DURATION = 5000;

/** Toast 上下文 */
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/** Toast 图标映射 */
const TOAST_ICONS: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

/** Toast 样式映射 */
const TOAST_STYLES: Record<ToastType, string> = {
  success: 'bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800',
  error: 'bg-error-50 border-error-200 dark:bg-error-900/20 dark:border-error-800',
  warning: 'bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800',
  info: 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800',
};

/** Toast 图标样式映射 */
const TOAST_ICON_STYLES: Record<ToastType, string> = {
  success: 'text-success-600 dark:text-success-400',
  error: 'text-error-600 dark:text-error-400',
  warning: 'text-warning-600 dark:text-warning-400',
  info: 'text-primary-600 dark:text-primary-400',
};

/** Toast Provider 属性 */
interface ToastProviderProps {
  children: ReactNode;
}

/**
 * ToastProvider - Toast 提供者组件
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  /** 添加 Toast */
  const addToast = useCallback((toast: Omit<Toast, 'id'>): string => {
    const id = nanoid();
    const newToast: Toast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);
    
    // 自动移除
    const duration = toast.duration ?? DEFAULT_DURATION;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  }, []);

  /** 移除 Toast */
  const removeToast = useCallback((id: string): void => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /** 成功提示 */
  const success = useCallback((title: string, message?: string): string => {
    return addToast(message ? { type: 'success', title, message } : { type: 'success', title });
  }, [addToast]);

  /** 错误提示 */
  const error = useCallback((title: string, message?: string): string => {
    return addToast(message ? { type: 'error', title, message } : { type: 'error', title });
  }, [addToast]);

  /** 警告提示 */
  const warning = useCallback((title: string, message?: string): string => {
    return addToast(message ? { type: 'warning', title, message } : { type: 'warning', title });
  }, [addToast]);

  /** 信息提示 */
  const info = useCallback((title: string, message?: string): string => {
    return addToast(message ? { type: 'info', title, message } : { type: 'info', title });
  }, [addToast]);

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

/** Toast 容器属性 */
interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

/**
 * ToastContainer - Toast 容器组件
 */
function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="pointer-events-none fixed bottom-0 right-0 z-toast flex flex-col gap-2 p-4">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => onClose(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

/** Toast 项属性 */
interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

/**
 * ToastItem - 单个 Toast 组件
 */
function ToastItem({ toast, onClose }: ToastItemProps) {
  const Icon = TOAST_ICONS[toast.type];
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      className={`pointer-events-auto flex w-80 items-start gap-3 rounded-lg border p-4 shadow-lg ${TOAST_STYLES[toast.type]}`}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 ${TOAST_ICON_STYLES[toast.type]}`} />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {toast.title}
        </p>
        {toast.message && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {toast.message}
          </p>
        )}
      </div>
      
      <button
        onClick={onClose}
        className="flex-shrink-0 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

/**
 * useToast - 获取 Toast 上下文的 Hook
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;
