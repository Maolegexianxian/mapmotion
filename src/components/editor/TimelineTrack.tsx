/**
 * 时间线轨道组件
 * 显示和管理单个轨道及其关键帧
 * 
 * @description
 * 轨道组件负责：
 * - 渲染轨道背景和网格
 * - 显示关键帧块和拖拽手柄
 * - 处理关键帧的选择、移动和调整
 * - 显示轨道标签和控制按钮
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Video,
  Route,
  Type,
  BarChart3,
  MapPin,
  MoreHorizontal,
  GripVertical,
} from 'lucide-react';

/** 关键帧数据接口 */
export interface KeyframeData {
  /** 关键帧唯一标识 */
  id: string;
  /** 开始时间（毫秒） */
  startMs: number;
  /** 持续时间（毫秒） */
  durationMs: number;
  /** 缓动函数名称 */
  easing: string;
  /** 是否选中 */
  isSelected?: boolean;
}

/** 轨道数据接口 */
export interface TrackData {
  /** 轨道唯一标识 */
  id: string;
  /** 轨道名称 */
  name: string;
  /** 轨道类型 */
  type: 'camera' | 'path' | 'label' | 'data' | 'overlay';
  /** 是否锁定 */
  isLocked: boolean;
  /** 是否可见 */
  isVisible: boolean;
  /** 轨道颜色 */
  color: string;
  /** 关键帧列表 */
  keyframes: KeyframeData[];
}

/** 轨道组件属性接口 */
interface TimelineTrackProps {
  /** 轨道数据 */
  track: TrackData;
  /** 时间线缩放比例（像素/秒） */
  scale: number;
  /** 轨道高度（像素） */
  height: number;
  /** 是否选中 */
  isSelected: boolean;
  /** 选中的关键帧 ID 列表 */
  selectedKeyframes: string[];
  /** 关键帧选择回调 */
  onKeyframeSelect: (keyframeId: string) => void;
  /** 关键帧移动回调 */
  onKeyframeMove?: (keyframeId: string, newStartMs: number) => void;
  /** 关键帧调整大小回调 */
  onKeyframeResize?: (keyframeId: string, newDurationMs: number) => void;
}

/** 轨道标签属性接口 */
interface TrackLabelProps {
  /** 轨道数据 */
  track: TrackData;
  /** 轨道高度（像素） */
  height: number;
  /** 是否选中 */
  isSelected: boolean;
  /** 选择回调 */
  onSelect: () => void;
  /** 锁定切换回调 */
  onToggleLock: () => void;
  /** 可见性切换回调 */
  onToggleVisibility: () => void;
}

/** 轨道类型图标映射 */
const TRACK_TYPE_ICONS = {
  camera: Video,
  path: Route,
  label: Type,
  data: BarChart3,
  overlay: MapPin,
};

/**
 * TimelineTrack - 时间线轨道组件
 * 
 * @description
 * 渲染单个轨道的关键帧内容区域
 * 
 * @param props - 组件属性
 * @returns 轨道内容 React 组件
 */
export function TimelineTrack({
  track,
  scale,
  height,
  isSelected,
  selectedKeyframes,
  onKeyframeSelect,
  onKeyframeMove,
  onKeyframeResize,
}: TimelineTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  
  /** 当前拖拽的关键帧 ID */
  const [draggingKeyframe, setDraggingKeyframe] = useState<string | null>(null);
  
  /** 拖拽类型：移动或调整大小 */
  const [dragType, setDragType] = useState<'move' | 'resize-start' | 'resize-end' | null>(null);
  
  /** 拖拽起始位置 */
  const [dragStartX, setDragStartX] = useState(0);
  
  /** 拖拽起始时间 */
  const [dragStartTime, setDragStartTime] = useState(0);

  /**
   * 将像素位置转换为时间（毫秒）
   * @param px - 像素位置
   * @returns 对应的时间（毫秒）
   */
  const pxToMs = useCallback((px: number): number => {
    return (px / scale) * 1000;
  }, [scale]);

  /**
   * 将时间（毫秒）转换为像素位置
   * @param ms - 时间（毫秒）
   * @returns 对应的像素位置
   */
  const msToPx = useCallback((ms: number): number => {
    return (ms / 1000) * scale;
  }, [scale]);

  /**
   * 处理关键帧鼠标按下事件
   * @param e - 鼠标事件
   * @param keyframe - 关键帧数据
   * @param type - 操作类型
   */
  const handleKeyframeMouseDown = useCallback((
    e: React.MouseEvent,
    keyframe: KeyframeData,
    type: 'move' | 'resize-start' | 'resize-end'
  ) => {
    e.stopPropagation();
    
    if (track.isLocked) return;
    
    setDraggingKeyframe(keyframe.id);
    setDragType(type);
    setDragStartX(e.clientX);
    setDragStartTime(type === 'resize-end' ? keyframe.durationMs : keyframe.startMs);
    
    onKeyframeSelect(keyframe.id);
  }, [track.isLocked, onKeyframeSelect]);

  /**
   * 处理鼠标移动事件
   * @param e - 鼠标事件
   */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingKeyframe || !dragType) return;
    
    const deltaX = e.clientX - dragStartX;
    const deltaMs = pxToMs(deltaX);
    
    if (dragType === 'move' && onKeyframeMove) {
      const newStartMs = Math.max(0, dragStartTime + deltaMs);
      onKeyframeMove(draggingKeyframe, newStartMs);
    } else if (dragType === 'resize-end' && onKeyframeResize) {
      const newDurationMs = Math.max(100, dragStartTime + deltaMs);
      onKeyframeResize(draggingKeyframe, newDurationMs);
    }
  }, [draggingKeyframe, dragType, dragStartX, dragStartTime, pxToMs, onKeyframeMove, onKeyframeResize]);

  /**
   * 处理鼠标释放事件
   */
  const handleMouseUp = useCallback(() => {
    setDraggingKeyframe(null);
    setDragType(null);
  }, []);

  /**
   * 注册全局鼠标事件监听器
   * 用于处理拖拽时鼠标移出轨道区域的情况
   */
  useEffect(() => {
    if (draggingKeyframe) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingKeyframe, handleMouseMove, handleMouseUp]);

  /**
   * 渲染单个关键帧
   * @param keyframe - 关键帧数据
   */
  const renderKeyframe = useCallback((keyframe: KeyframeData) => {
    const left = msToPx(keyframe.startMs);
    const width = msToPx(keyframe.durationMs);
    const isKeyframeSelected = selectedKeyframes.includes(keyframe.id);
    
    return (
      <motion.div
        key={keyframe.id}
        className={`
          absolute top-1 bottom-1 flex items-center rounded-md cursor-pointer
          transition-shadow duration-150
          ${isKeyframeSelected 
            ? 'ring-2 ring-white ring-offset-1 ring-offset-transparent shadow-lg' 
            : 'hover:brightness-110'
          }
          ${track.isLocked ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={{
          left,
          width: Math.max(width, 20),
          backgroundColor: track.color,
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
        onMouseDown={(e) => handleKeyframeMouseDown(e, keyframe, 'move')}
      >
        {/* 左侧调整手柄 */}
        <div
          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 rounded-l-md"
          onMouseDown={(e) => handleKeyframeMouseDown(e, keyframe, 'resize-start')}
        />
        
        {/* 关键帧内容 */}
        <div className="flex-1 px-2 overflow-hidden">
          <span className="text-xs font-medium text-white/90 truncate">
            {(keyframe.durationMs / 1000).toFixed(1)}s
          </span>
        </div>
        
        {/* 右侧调整手柄 */}
        <div
          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 rounded-r-md"
          onMouseDown={(e) => handleKeyframeMouseDown(e, keyframe, 'resize-end')}
        />
      </motion.div>
    );
  }, [msToPx, selectedKeyframes, track.color, track.isLocked, handleKeyframeMouseDown]);

  return (
    <div
      ref={trackRef}
      className={`
        relative border-b border-editor-border
        ${isSelected ? 'bg-primary-900/20' : 'bg-transparent hover:bg-slate-800/30'}
        ${track.isLocked ? 'opacity-60' : ''}
      `}
      style={{ height }}
    >
      {/* 轨道背景网格 */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent ${scale - 1}px,
            rgba(255,255,255,0.03) ${scale - 1}px,
            rgba(255,255,255,0.03) ${scale}px
          )`,
        }}
      />
      
      {/* 关键帧列表 */}
      {track.keyframes.map(renderKeyframe)}
    </div>
  );
}

/**
 * TrackLabel - 轨道标签组件
 * 
 * @description
 * 渲染轨道的标签区域，包含：
 * - 轨道类型图标
 * - 轨道名称
 * - 锁定/可见性控制按钮
 * 
 * @param props - 组件属性
 * @returns 轨道标签 React 组件
 */
export function TrackLabel({
  track,
  height,
  isSelected,
  onSelect,
  onToggleLock,
  onToggleVisibility,
}: TrackLabelProps) {
  const { t } = useTranslation();
  const Icon = TRACK_TYPE_ICONS[track.type] || MapPin;
  
  return (
    <div
      className={`
        flex items-center gap-2 border-b border-editor-border px-2 cursor-pointer
        transition-colors duration-150
        ${isSelected 
          ? 'bg-primary-900/30' 
          : 'hover:bg-slate-800/50'
        }
      `}
      style={{ height }}
      onClick={onSelect}
    >
      {/* 拖拽手柄 */}
      <div className="flex h-5 w-5 items-center justify-center text-slate-600 cursor-grab active:cursor-grabbing">
        <GripVertical className="h-3.5 w-3.5" />
      </div>
      
      {/* 轨道类型图标 */}
      <div 
        className="flex h-6 w-6 items-center justify-center rounded"
        style={{ backgroundColor: `${track.color}30` }}
      >
        <Icon 
          className="h-3.5 w-3.5" 
          style={{ color: track.color }}
        />
      </div>
      
      {/* 轨道名称 */}
      <span className="flex-1 truncate text-sm text-slate-300">
        {track.name}
      </span>
      
      {/* 控制按钮组 */}
      <div className="flex items-center gap-0.5">
        {/* 可见性按钮 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className={`
            flex h-6 w-6 items-center justify-center rounded transition-colors
            ${track.isVisible 
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' 
              : 'text-slate-600 hover:text-slate-400 hover:bg-slate-700'
            }
          `}
          title={track.isVisible ? t('timeline.hide') : t('timeline.show')}
          aria-label={track.isVisible ? t('timeline.hide') : t('timeline.show')}
        >
          {track.isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </button>
        
        {/* 锁定按钮 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
          className={`
            flex h-6 w-6 items-center justify-center rounded transition-colors
            ${track.isLocked 
              ? 'text-warning-500 hover:text-warning-400 hover:bg-slate-700' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700'
            }
          `}
          title={track.isLocked ? t('timeline.unlock') : t('timeline.lock')}
          aria-label={track.isLocked ? t('timeline.unlock') : t('timeline.lock')}
        >
          {track.isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
        </button>
        
        {/* 更多选项按钮 */}
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex h-6 w-6 items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-700 hover:text-slate-300"
          title={t('common.more')}
          aria-label={t('common.more')}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export default TimelineTrack;
