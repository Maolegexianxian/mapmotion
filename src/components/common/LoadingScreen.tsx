/**
 * 加载屏幕组件
 * 用于应用初始化或页面加载时显示
 */
import { Loader2 } from 'lucide-react';

/** 加载屏幕属性 */
interface LoadingScreenProps {
  /** 加载文本 */
  text?: string;
  /** 是否全屏 */
  fullScreen?: boolean;
}

/**
 * LoadingScreen - 加载屏幕组件
 * 
 * @description
 * 显示居中的加载动画和可选的加载文本
 * 
 * @param props - 组件属性
 * @returns 加载屏幕组件
 */
export function LoadingScreen({ text = '加载中...', fullScreen = true }: LoadingScreenProps) {
  const containerClass = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-editor-bg'
    : 'flex h-full w-full items-center justify-center';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
            <span className="text-xl font-bold text-white">M</span>
          </div>
          <span className="text-xl font-semibold text-slate-900 dark:text-white">
            MapMotion
          </span>
        </div>
        
        {/* 加载动画 */}
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        
        {/* 加载文本 */}
        <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>
      </div>
    </div>
  );
}

export default LoadingScreen;
