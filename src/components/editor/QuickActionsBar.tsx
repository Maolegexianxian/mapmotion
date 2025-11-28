/**
 * 快捷操作工具栏组件
 * 提供浮动式快速创建入口，简化工作流程
 * 
 * @description
 * 快捷操作栏是编辑器的核心交互组件，采用简洁的浮动设计：
 * - 中央浮动定位，不干扰主要内容
 * - 图标化操作按钮，配合文字提示
 * - 支持键盘快捷键
 * - 展开/收起状态切换
 */
import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  MapPin,
  Route,
  Type,
  Video,
  FileSpreadsheet,
  Sparkles,
  ChevronUp,
  Wand2,
} from 'lucide-react';

/** 快捷操作项接口 */
interface QuickAction {
  /** 操作唯一标识 */
  id: string;
  /** 操作图标组件 */
  icon: typeof MapPin;
  /** 操作标题国际化键 */
  titleKey: string;
  /** 操作描述国际化键 */
  descriptionKey: string;
  /** 背景渐变类名 */
  gradient: string;
  /** 操作执行回调 */
  onClick: () => void;
  /** 键盘快捷键提示 */
  shortcut?: string;
}

/** 组件属性接口 */
interface QuickActionsBarProps {
  /** 添加标记点回调 */
  onAddMarker?: () => void;
  /** 添加路线回调 */
  onAddRoute?: () => void;
  /** 添加标签回调 */
  onAddLabel?: () => void;
  /** 添加镜头动画回调 */
  onAddCamera?: () => void;
  /** 导入数据回调 */
  onImportData?: () => void;
  /** 使用模板回调 */
  onUseTemplate?: () => void;
}

/**
 * QuickActionsBar - 快捷操作工具栏组件
 * 
 * @description
 * 提供便捷的创建入口，降低用户操作门槛。
 * 设计原则：
 * - 最常用操作优先展示
 * - 视觉层次清晰
 * - 交互反馈即时
 * 
 * @param props - 组件属性
 * @returns 快捷操作工具栏 React 组件
 */
export function QuickActionsBar({
  onAddMarker,
  onAddRoute,
  onAddLabel,
  onAddCamera,
  onImportData,
  onUseTemplate,
}: QuickActionsBarProps) {
  const { t } = useTranslation();
  
  /** 是否展开状态 */
  const [isExpanded, setIsExpanded] = useState(false);
  
  /** 悬停的操作项 ID */
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  /**
   * 快捷操作配置列表
   * 按使用频率和重要性排序
   */
  const actions: QuickAction[] = useMemo(() => [
    {
      id: 'route',
      icon: Route,
      titleKey: 'quickActions.addRoute',
      descriptionKey: 'quickActions.addRouteDesc',
      gradient: 'from-emerald-500 to-teal-600',
      onClick: () => onAddRoute?.(),
      shortcut: 'R',
    },
    {
      id: 'marker',
      icon: MapPin,
      titleKey: 'quickActions.addMarker',
      descriptionKey: 'quickActions.addMarkerDesc',
      gradient: 'from-blue-500 to-indigo-600',
      onClick: () => onAddMarker?.(),
      shortcut: 'M',
    },
    {
      id: 'label',
      icon: Type,
      titleKey: 'quickActions.addLabel',
      descriptionKey: 'quickActions.addLabelDesc',
      gradient: 'from-amber-500 to-orange-600',
      onClick: () => onAddLabel?.(),
      shortcut: 'L',
    },
    {
      id: 'camera',
      icon: Video,
      titleKey: 'quickActions.addCamera',
      descriptionKey: 'quickActions.addCameraDesc',
      gradient: 'from-purple-500 to-violet-600',
      onClick: () => onAddCamera?.(),
      shortcut: 'C',
    },
    {
      id: 'data',
      icon: FileSpreadsheet,
      titleKey: 'quickActions.importData',
      descriptionKey: 'quickActions.importDataDesc',
      gradient: 'from-pink-500 to-rose-600',
      onClick: () => onImportData?.(),
      shortcut: 'D',
    },
    {
      id: 'template',
      icon: Sparkles,
      titleKey: 'quickActions.useTemplate',
      descriptionKey: 'quickActions.useTemplateDesc',
      gradient: 'from-cyan-500 to-sky-600',
      onClick: () => onUseTemplate?.(),
      shortcut: 'T',
    },
  ], [onAddMarker, onAddRoute, onAddLabel, onAddCamera, onImportData, onUseTemplate]);

  /**
   * 切换展开状态
   */
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  /**
   * 渲染单个快捷操作按钮
   * @param action - 操作配置
   * @param index - 索引（用于动画延迟）
   */
  const renderActionButton = useCallback((action: QuickAction, index: number) => {
    const Icon = action.icon;
    const isHovered = hoveredAction === action.id;
    
    return (
      <motion.button
        key={action.id}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ 
          duration: 0.2, 
          delay: index * 0.05,
          ease: 'easeOut',
        }}
        onMouseEnter={() => setHoveredAction(action.id)}
        onMouseLeave={() => setHoveredAction(null)}
        onClick={() => {
          action.onClick();
          setIsExpanded(false);
        }}
        className={`
          relative flex items-center gap-3 px-4 py-3 rounded-xl
          bg-gradient-to-r ${action.gradient}
          text-white font-medium text-sm
          shadow-lg shadow-black/20
          transition-all duration-200
          hover:shadow-xl hover:shadow-black/30
          hover:-translate-y-0.5 hover:scale-[1.02]
          active:scale-[0.98]
          focus:outline-none focus:ring-2 focus:ring-white/30
        `}
        aria-label={t(action.titleKey)}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <span className="whitespace-nowrap">{t(action.titleKey)}</span>
        
        {/* 快捷键提示 */}
        {action.shortcut && (
          <span className="ml-auto px-1.5 py-0.5 rounded bg-white/20 text-xs font-mono">
            {action.shortcut}
          </span>
        )}
        
        {/* 悬停时的描述提示 */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute left-0 right-0 -bottom-8 text-center"
            >
              <span className="text-xs text-slate-400 bg-slate-900/90 px-2 py-1 rounded">
                {t(action.descriptionKey)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }, [hoveredAction, t]);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3">
      {/* 展开的操作面板 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap justify-center gap-2 p-4 rounded-2xl bg-slate-900/95 border border-white/10 backdrop-blur-xl shadow-2xl max-w-lg"
          >
            {/* 面板标题 */}
            <div className="w-full flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-primary-400" />
                <span className="text-sm font-medium text-slate-200">
                  {t('quickActions.title')}
                </span>
              </div>
              <button
                onClick={toggleExpanded}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label={t('common.close')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* 操作按钮网格 */}
            <div className="grid grid-cols-2 gap-2 w-full">
              {actions.map((action, index) => renderActionButton(action, index))}
            </div>
            
            {/* 底部提示 */}
            <div className="w-full mt-2 pt-2 border-t border-white/5 text-center">
              <span className="text-xs text-slate-500">
                {t('quickActions.hint')}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 主触发按钮 */}
      <motion.button
        onClick={toggleExpanded}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          flex items-center gap-2 px-5 py-3 rounded-full
          bg-gradient-to-r from-primary-600 to-accent-600
          text-white font-semibold
          shadow-lg shadow-primary-500/30
          hover:shadow-xl hover:shadow-primary-500/40
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-slate-900
        `}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? t('common.close') : t('quickActions.open')}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Plus className="h-5 w-5" />
        </motion.div>
        <span>{isExpanded ? t('common.close') : t('quickActions.create')}</span>
        <ChevronUp 
          className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </motion.button>
    </div>
  );
}

export default QuickActionsBar;
