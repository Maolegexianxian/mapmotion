/**
 * 地图样式选择器组件
 * 
 * @description
 * 提供地图样式选择功能，支持：
 * - 预设样式库浏览
 * - 样式预览
 * - 快速切换样式
 */
import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Lock, Palette, ChevronDown } from 'lucide-react';
import { mapStyleService, type MapStylePreset } from '@/services';

/** 组件属性 */
interface StyleSelectorProps {
  /** 当前选中的样式 ID */
  currentStyleId: string;
  /** 样式变更回调 */
  onStyleChange: (styleId: string, styleUrl: string) => void;
  /** 是否显示高级样式 */
  showPremium?: boolean;
  /** 是否为紧凑模式 */
  compact?: boolean;
}

/**
 * StyleSelector - 地图样式选择器
 */
export function StyleSelector({
  currentStyleId,
  onStyleChange,
  showPremium = false,
  compact = false,
}: StyleSelectorProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // 获取可用样式列表
  const styles = useMemo(() => {
    return mapStyleService.getPresetStyles(showPremium);
  }, [showPremium]);

  // 当前选中的样式
  const currentStyle = useMemo(() => {
    return styles.find((s: MapStylePreset) => s.id === currentStyleId) ?? styles[0];
  }, [styles, currentStyleId]);

  // 处理样式选择
  const handleStyleSelect = useCallback((style: MapStylePreset) => {
    if (style.isPremium && !showPremium) {
      // 高级样式需要升级
      return;
    }
    onStyleChange(style.id, style.styleUrl);
    setIsOpen(false);
  }, [onStyleChange, showPremium]);

  // 紧凑模式下拉选择器
  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between gap-2 rounded bg-editor-hover px-3 py-2 text-sm text-white hover:bg-editor-hover/80"
        >
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-slate-400" />
            <span>{currentStyle?.name ?? '选择样式'}</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            {/* 点击外部关闭 */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            
            {/* 下拉菜单 */}
            <div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-lg bg-editor-panel shadow-xl border border-editor-border overflow-hidden">
              <div className="max-h-80 overflow-y-auto p-2">
                {styles.map((style: MapStylePreset) => (
                  <button
                    key={style.id}
                    onClick={() => handleStyleSelect(style)}
                    disabled={style.isPremium && !showPremium}
                    className={`
                      flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm
                      ${style.id === currentStyleId
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-300 hover:bg-editor-hover'
                      }
                      ${style.isPremium && !showPremium ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <span>{style.name}</span>
                    {style.isPremium && !showPremium ? (
                      <Lock className="h-3 w-3 text-slate-400" />
                    ) : style.id === currentStyleId ? (
                      <Check className="h-4 w-4" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // 完整网格视图
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide">
        {t('editor.sidebar.mapStyle')}
      </h4>
      
      <div className="grid grid-cols-2 gap-2">
        {styles.map((style: MapStylePreset) => (
          <StyleCard
            key={style.id}
            style={style}
            isSelected={style.id === currentStyleId}
            isLocked={style.isPremium && !showPremium}
            onClick={() => handleStyleSelect(style)}
          />
        ))}
      </div>
    </div>
  );
}

/** 样式卡片属性 */
interface StyleCardProps {
  style: MapStylePreset;
  isSelected: boolean;
  isLocked: boolean;
  onClick: () => void;
}

/**
 * StyleCard - 样式卡片
 */
function StyleCard({ style, isSelected, isLocked, onClick }: StyleCardProps) {
  // 获取背景预览颜色（基于样式名称生成）
  const previewColor = useMemo(() => {
    const colors: Record<string, string> = {
      light: 'from-slate-100 to-slate-200',
      dark: 'from-slate-800 to-slate-900',
      streets: 'from-amber-50 to-amber-100',
      satellite: 'from-emerald-800 to-emerald-900',
      outdoors: 'from-green-200 to-green-300',
      navigation: 'from-blue-50 to-blue-100',
      monochrome: 'from-gray-200 to-gray-300',
      blueprint: 'from-blue-900 to-blue-950',
      vintage: 'from-orange-100 to-orange-200',
      watercolor: 'from-cyan-100 to-cyan-200',
    };
    return colors[style.id] ?? 'from-slate-300 to-slate-400';
  }, [style.id]);

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`
        group relative overflow-hidden rounded-lg border-2 transition-all
        ${isSelected
          ? 'border-primary-500 ring-2 ring-primary-500/20'
          : 'border-transparent hover:border-slate-600'
        }
        ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}
      `}
    >
      {/* 预览背景 */}
      <div className={`aspect-[4/3] bg-gradient-to-br ${previewColor}`}>
        {/* 模拟地图元素 */}
        <div className="relative h-full w-full p-2">
          {/* 模拟道路 */}
          <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-white/40 rounded" />
          <div className="absolute top-1/4 bottom-1/4 left-1/2 w-0.5 bg-white/40 rounded" />
          {/* 模拟标记点 */}
          <div className="absolute top-1/3 left-1/3 h-2 w-2 rounded-full bg-red-500/70" />
          <div className="absolute bottom-1/4 right-1/4 h-1.5 w-1.5 rounded-full bg-blue-500/70" />
        </div>
      </div>

      {/* 样式名称 */}
      <div className="bg-editor-panel px-2 py-1.5">
        <span className="text-xs font-medium text-slate-300">{style.name}</span>
      </div>

      {/* 选中指示器 */}
      {isSelected && (
        <div className="absolute top-1 right-1 rounded-full bg-primary-500 p-0.5">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}

      {/* 锁定指示器 */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Lock className="h-5 w-5 text-white" />
        </div>
      )}
    </button>
  );
}

export default StyleSelector;
