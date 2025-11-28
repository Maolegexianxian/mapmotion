/**
 * 欢迎引导覆盖层组件
 * 为新用户提供友好的入门引导
 * 
 * @description
 * 当用户首次进入编辑器或项目为空时显示，提供：
 * - 快速开始向导
 * - 模板选择入口
 * - 功能介绍卡片
 * - 跳过/不再显示选项
 */
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Route,
  MapPin,
  Video,
  FileSpreadsheet,
  Play,
  ArrowRight,
  Lightbulb,
  Rocket,
} from 'lucide-react';

/** 快速开始选项接口 */
interface QuickStartOption {
  /** 选项唯一标识 */
  id: string;
  /** 选项图标 */
  icon: typeof Route;
  /** 标题国际化键 */
  titleKey: string;
  /** 描述国际化键 */
  descriptionKey: string;
  /** 渐变类名 */
  gradient: string;
  /** 点击回调 */
  onClick: () => void;
}

/** 组件属性接口 */
interface WelcomeOverlayProps {
  /** 是否显示 */
  isVisible: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 创建路线动画回调 */
  onCreateRoute?: () => void;
  /** 添加标记点回调 */
  onAddMarker?: () => void;
  /** 创建镜头动画回调 */
  onCreateCamera?: () => void;
  /** 导入数据回调 */
  onImportData?: () => void;
  /** 使用模板回调 */
  onUseTemplate?: () => void;
  /** 观看教程回调 */
  onWatchTutorial?: () => void;
}

/**
 * WelcomeOverlay - 欢迎引导覆盖层组件
 * 
 * @description
 * 提供引导式的入门体验，帮助新用户快速上手。
 * 设计原则：
 * - 简洁不打扰
 * - 目标明确
 * - 可轻松跳过
 * 
 * @param props - 组件属性
 * @returns 欢迎引导覆盖层 React 组件
 */
export function WelcomeOverlay({
  isVisible,
  onClose,
  onCreateRoute,
  onAddMarker,
  onCreateCamera,
  onImportData,
  onUseTemplate,
  onWatchTutorial,
}: WelcomeOverlayProps) {
  const { t } = useTranslation();
  
  /** 不再显示选项状态 */
  const [dontShowAgain, setDontShowAgain] = useState(false);

  /**
   * 快速开始选项配置列表
   */
  const quickStartOptions: QuickStartOption[] = [
    {
      id: 'route',
      icon: Route,
      titleKey: 'welcome.createRoute',
      descriptionKey: 'welcome.createRouteDesc',
      gradient: 'from-emerald-500 to-teal-600',
      onClick: () => {
        onCreateRoute?.();
        handleClose();
      },
    },
    {
      id: 'marker',
      icon: MapPin,
      titleKey: 'welcome.addMarker',
      descriptionKey: 'welcome.addMarkerDesc',
      gradient: 'from-blue-500 to-indigo-600',
      onClick: () => {
        onAddMarker?.();
        handleClose();
      },
    },
    {
      id: 'camera',
      icon: Video,
      titleKey: 'welcome.createCamera',
      descriptionKey: 'welcome.createCameraDesc',
      gradient: 'from-purple-500 to-violet-600',
      onClick: () => {
        onCreateCamera?.();
        handleClose();
      },
    },
    {
      id: 'data',
      icon: FileSpreadsheet,
      titleKey: 'welcome.importData',
      descriptionKey: 'welcome.importDataDesc',
      gradient: 'from-pink-500 to-rose-600',
      onClick: () => {
        onImportData?.();
        handleClose();
      },
    },
  ];

  /**
   * 处理关闭
   * 如果勾选了不再显示，存储到本地
   */
  const handleClose = useCallback(() => {
    if (dontShowAgain) {
      localStorage.setItem('mapmotion-hide-welcome', 'true');
    }
    onClose();
  }, [dontShowAgain, onClose]);

  /**
   * 渲染快速开始选项卡片
   */
  const renderOptionCard = useCallback((option: QuickStartOption, index: number) => {
    const Icon = option.icon;
    
    return (
      <motion.button
        key={option.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + index * 0.1 }}
        onClick={option.onClick}
        className={`
          group relative flex flex-col items-center gap-3 p-6 rounded-2xl
          bg-gradient-to-br ${option.gradient}
          text-white text-center
          shadow-lg shadow-black/20
          transition-all duration-300
          hover:shadow-xl hover:shadow-black/30
          hover:-translate-y-1 hover:scale-[1.02]
          focus:outline-none focus:ring-2 focus:ring-white/50
        `}
      >
        {/* 图标容器 */}
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <Icon className="h-7 w-7" />
        </div>
        
        {/* 标题 */}
        <h3 className="font-semibold text-lg">
          {t(option.titleKey)}
        </h3>
        
        {/* 描述 */}
        <p className="text-sm text-white/80 leading-relaxed">
          {t(option.descriptionKey)}
        </p>
        
        {/* 箭头指示 */}
        <ArrowRight className="absolute bottom-4 right-4 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.button>
    );
  }, [t]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          {/* 欢迎卡片 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="relative w-full max-w-3xl mx-4 bg-slate-900/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* 背景装饰 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl" />
            </div>
            
            {/* 关闭按钮 */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={t('common.close')}
            >
              <X className="h-5 w-5" />
            </button>
            
            {/* 内容区域 */}
            <div className="relative z-10 p-8">
              {/* 头部 */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mb-4"
                >
                  <Rocket className="h-8 w-8 text-white" />
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  {t('welcome.title')}
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-slate-400 max-w-md mx-auto"
                >
                  {t('welcome.subtitle')}
                </motion.p>
              </div>
              
              {/* 快速开始选项网格 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {quickStartOptions.map((option, index) => 
                  renderOptionCard(option, index)
                )}
              </div>
              
              {/* 底部操作区 */}
              <div className="flex flex-col items-center gap-4 pt-4 border-t border-white/10">
                {/* 模板和教程按钮 */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      onUseTemplate?.();
                      handleClose();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{t('welcome.browseTemplates')}</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      onWatchTutorial?.();
                      handleClose();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    <span>{t('welcome.watchTutorial')}</span>
                  </button>
                </div>
                
                {/* 不再显示选项 */}
                <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-primary-500 focus:ring-primary-500/50"
                  />
                  <span className="group-hover:text-slate-400 transition-colors">
                    {t('welcome.dontShowAgain')}
                  </span>
                </label>
                
                {/* 提示 */}
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Lightbulb className="h-3 w-3" />
                  <span>{t('welcome.tip')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default WelcomeOverlay;
