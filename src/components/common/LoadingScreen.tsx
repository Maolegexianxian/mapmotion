/**
 * 加载屏幕组件
 * 用于应用初始化或页面加载时显示
 */
import { motion } from 'framer-motion';

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
    ? "fixed inset-0 z-[100] bg-[#020204]" 
    : "absolute inset-0 bg-[#020204] z-50";

  return (
    <div className={`${containerClass} flex items-center justify-center`}>
      {/* 背景光效 */}
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-primary-600/10 blur-[80px] animate-pulse" />
      
      <div className="relative flex flex-col items-center gap-6">
        {/* Logo 动画 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-[0_0_40px_-10px_rgba(14,165,233,0.5)]">
            <span className="text-3xl font-bold text-white">M</span>
          </div>
          {/* 环绕光圈 */}
          <div className="absolute -inset-4 border border-white/5 rounded-3xl animate-[spin_4s_linear_infinite]" />
          <div className="absolute -inset-4 border border-t-primary-500/50 border-r-transparent border-b-transparent border-l-transparent rounded-3xl animate-[spin_3s_linear_infinite]" />
        </motion.div>

        {/* 加载文字 */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-lg font-medium text-white tracking-tight">MapMotion</h2>
          <div className="flex gap-1">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              className="h-1.5 w-1.5 rounded-full bg-primary-500"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              className="h-1.5 w-1.5 rounded-full bg-primary-500"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              className="h-1.5 w-1.5 rounded-full bg-primary-500"
            />
          </div>
          <p className="text-sm text-slate-500">{text}</p>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
