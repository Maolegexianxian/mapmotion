import { Map, Play, Users, Clock, ArrowLeft, Star, Lock } from 'lucide-react';
import { SpotlightCard } from '@/components/common/SpotlightCard';
import { Template, TEMPLATE_CATEGORIES } from '@/constants/templates';

interface TemplateCardProps {
  template: Template;
  onUse?: () => void;
  className?: string;
}

/**
 * 模板卡片组件
 * 展示模板的缩略图、基本信息和操作按钮
 * 
 * @param template 模板数据对象
 * @param onUse 点击"使用模板"时的回调
 * @param className 自定义样式类名
 */
export function TemplateCard({ template, onUse, className = '' }: TemplateCardProps) {
  const categoryConfig = TEMPLATE_CATEGORIES.find(c => c.id === template.category);
  const CategoryIcon = categoryConfig?.icon || Map;

  return (
    <SpotlightCard className={`h-full flex flex-col group ${className}`}>
      {/* 标签区域 */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        {/* 精选标签 */}
        {template.featured && (
          <div className="flex items-center gap-1 rounded-full bg-yellow-500/90 px-2.5 py-0.5 text-[10px] font-bold text-black backdrop-blur-sm shadow-lg shadow-yellow-500/20">
            <Star className="h-3 w-3 fill-current" />
            Featured
          </div>
        )}
        {/* Pro 标签 */}
        {template.isPro && (
          <div className="flex items-center gap-1 rounded-full bg-primary-500/90 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm shadow-lg shadow-primary-500/20 w-fit">
            <Lock className="h-3 w-3" />
            Pro
          </div>
        )}
      </div>

      {/* 缩略图区域 */}
      <div className="aspect-video bg-gradient-to-br from-slate-800/50 to-slate-900/50 relative overflow-hidden border-b border-white/5">
        {/* 装饰背景 - 动态网格 */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]" />
        
        {/* 缩略图或渐变背景 */}
        {template.thumbnail ? (
          <div className={`absolute inset-0 ${template.thumbnail}`} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent opacity-60" />
        
        {/* 图标展示 (当没有缩略图时作为占位) */}
        <div className="absolute inset-0 flex items-center justify-center transform transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3">
          <CategoryIcon className="h-16 w-16 text-slate-800 group-hover:text-primary-500/20 transition-colors duration-500" />
        </div>
        
        {/* 悬停操作层 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 backdrop-blur-[2px] opacity-0 transition-all duration-300 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 z-10">
          <button 
            onClick={onUse}
            className="flex items-center gap-2 rounded-full bg-primary-600 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-primary-600/30 hover:bg-primary-500 hover:scale-105 hover:shadow-primary-600/50 transition-all"
          >
            <Play className="h-4 w-4 fill-current" />
            Use Template
          </button>
        </div>
      </div>

      {/* 信息区域 */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-medium text-slate-400 border border-white/5 group-hover:border-primary-500/30 group-hover:text-primary-400 transition-colors">
            <CategoryIcon className="h-3 w-3" />
            {categoryConfig?.label}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
            <Users className="h-3 w-3" />
            {template.views.toLocaleString()}
          </div>
        </div>

        <h3 className="font-bold text-slate-200 text-lg mb-2 line-clamp-1 group-hover:text-primary-400 transition-colors">
          {template.name}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4 flex-1">
          {template.description}
        </p>
        
        {/* 底部栏 */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
          <span className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <Clock className="h-3 w-3" />
            {template.duration}
          </span>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2 group-hover:translate-x-0">
            <span className="text-xs text-primary-500 font-medium">Start Now</span>
            <ArrowLeft className="h-3 w-3 text-primary-500 rotate-180" />
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}
