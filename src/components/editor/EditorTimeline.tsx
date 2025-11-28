/**
 * 编辑器时间线组件
 * 管理动画时间线、轨道和关键帧
 * 
 * @description
 * 时间线是动画编辑的核心组件，提供：
 * - 时间刻度和播放头显示
 * - 轨道管理（相机、路径、标签等）
 * - 关键帧编辑和调整
 * - 播放控制（播放、暂停、定位）
 * - 缩放和滚动
 */
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  Video,
  MapPin,
  Route,
  Type,
  BarChart3,
} from 'lucide-react';

import { useTimelineStore } from '../../stores/timelineStore';
import { useProjectStore } from '../../stores/projectStore';
import { TimelineTrack, TrackLabel } from './TimelineTrack';

/** 时间线属性接口 */
interface EditorTimelineProps {
  /** 是否折叠 */
  isCollapsed: boolean;
  /** 折叠状态切换回调 */
  onToggle: () => void;
  /** 时间线高度（像素） */
  height?: number;
}

/** 轨道数据接口 */
interface TrackData {
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
  /** 关键帧数据 */
  keyframes: KeyframeData[];
}

/** 关键帧数据接口 */
interface KeyframeData {
  /** 关键帧唯一标识 */
  id: string;
  /** 开始时间（毫秒） */
  startMs: number;
  /** 持续时间（毫秒） */
  durationMs: number;
  /** 缓动函数 */
  easing: string;
  /** 是否选中 */
  isSelected?: boolean;
}

/** 轨道类型配置 */
const TRACK_TYPE_CONFIG = {
  camera: { icon: Video, color: '#8b5cf6', label: 'timeline.camera' },
  path: { icon: Route, color: '#10b981', label: 'timeline.path' },
  label: { icon: Type, color: '#f59e0b', label: 'timeline.label' },
  data: { icon: BarChart3, color: '#ec4899', label: 'timeline.data' },
  overlay: { icon: MapPin, color: '#3b82f6', label: 'timeline.overlay' },
};

/** 时间线默认配置 */
const TIMELINE_CONFIG = {
  /** 最小缩放比例（像素/秒） */
  minScale: 20,
  /** 最大缩放比例（像素/秒） */
  maxScale: 200,
  /** 默认缩放比例（像素/秒） */
  defaultScale: 50,
  /** 轨道高度（像素） */
  trackHeight: 36,
  /** 标签列宽度（像素） */
  labelWidth: 200,
  /** 时间刻度高度（像素） */
  rulerHeight: 28,
};

/**
 * EditorTimeline - 编辑器时间线组件
 */
export function EditorTimeline({ isCollapsed, onToggle, height = 320 }: EditorTimelineProps) {
  const { t } = useTranslation();
  const timelineRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  
  /** 时间线状态 */
  const { 
    currentTime, 
    isPlaying,
    play,
    pause,
    stop,
    seekTo,
  } = useTimelineStore();
  
  /** 项目状态 */
  const { currentProject } = useProjectStore();
  
  /** 时间线缩放比例（像素/秒） */
  const [scale, setScale] = useState(TIMELINE_CONFIG.defaultScale);
  
  /** 时间线水平滚动位置 */
  const [scrollLeft, setScrollLeft] = useState(0);
  
  /** 选中的轨道 ID 列表 */
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  
  /** 选中的关键帧 ID 列表 */
  const [selectedKeyframes, setSelectedKeyframes] = useState<string[]>([]);
  
  /** 是否正在拖拽播放头 */
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);

  /**
   * 从项目数据生成轨道列表
   */
  const tracks: TrackData[] = useMemo(() => {
    if (!currentProject?.scenes?.[0]?.items) {
      // 返回默认示例轨道
      return [
        {
          id: 'camera-1',
          name: '主镜头动画',
          type: 'camera',
          isLocked: false,
          isVisible: true,
          color: TRACK_TYPE_CONFIG.camera.color,
          keyframes: [
            { id: 'kf-1', startMs: 0, durationMs: 3000, easing: 'easeInOut' },
            { id: 'kf-2', startMs: 5000, durationMs: 2000, easing: 'easeOut' },
          ],
        },
        {
          id: 'path-1',
          name: '路线动画',
          type: 'path',
          isLocked: false,
          isVisible: true,
          color: TRACK_TYPE_CONFIG.path.color,
          keyframes: [
            { id: 'kf-3', startMs: 2000, durationMs: 6000, easing: 'linear' },
          ],
        },
        {
          id: 'label-1',
          name: '城市标签',
          type: 'label',
          isLocked: false,
          isVisible: true,
          color: TRACK_TYPE_CONFIG.label.color,
          keyframes: [
            { id: 'kf-4', startMs: 3000, durationMs: 4000, easing: 'easeIn' },
          ],
        },
      ];
    }
    
    // 从项目 items 生成轨道
    return currentProject.scenes[0].items.map((item: { id: string; name?: string; type: string; startMs: number; durationMs: number; easing?: string }) => ({
      id: item.id,
      name: item.name || `${item.type} 轨道`,
      type: item.type as TrackData['type'],
      isLocked: false,
      isVisible: true,
      color: TRACK_TYPE_CONFIG[item.type as keyof typeof TRACK_TYPE_CONFIG]?.color || '#6b7280',
      keyframes: [{
        id: `kf-${item.id}`,
        startMs: item.startMs,
        durationMs: item.durationMs,
        easing: item.easing || 'linear',
      }],
    }));
  }, [currentProject]);

  /**
   * 总时长（毫秒）
   */
  const totalDuration = useMemo(() => {
    return currentProject?.meta?.durationMs || 10000;
  }, [currentProject]);

  /**
   * 时间轴总宽度（像素）
   */
  const timelineWidth = useMemo(() => {
    return (totalDuration / 1000) * scale;
  }, [totalDuration, scale]);

  /**
   * 播放头位置（像素）
   */
  const playheadPosition = useMemo(() => {
    return (currentTime / 1000) * scale;
  }, [currentTime, scale]);

  /**
   * 生成时间刻度
   */
  const timeMarkers = useMemo(() => {
    const markers: { time: number; label: string; isMajor: boolean }[] = [];
    const interval = scale >= 100 ? 500 : scale >= 50 ? 1000 : 2000; // 毫秒
    const majorInterval = interval * 2;
    
    for (let time = 0; time <= totalDuration; time += interval) {
      const isMajor = time % majorInterval === 0;
      const seconds = time / 1000;
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      
      markers.push({
        time,
        label: isMajor ? `${minutes}:${secs.toFixed(1).padStart(4, '0')}` : '',
        isMajor,
      });
    }
    
    return markers;
  }, [totalDuration, scale]);

  /**
   * 处理播放/暂停切换
   */
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  /**
   * 处理停止播放
   */
  const handleStop = useCallback(() => {
    stop();
    seekTo(0);
  }, [stop, seekTo]);

  /**
   * 处理跳到开头
   */
  const handleSkipBack = useCallback(() => {
    seekTo(0);
  }, [seekTo]);

  /**
   * 处理跳到结尾
   */
  const handleSkipForward = useCallback(() => {
    seekTo(totalDuration);
  }, [seekTo, totalDuration]);

  /**
   * 处理缩放增加
   */
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.5, TIMELINE_CONFIG.maxScale));
  }, []);

  /**
   * 处理缩放减少
   */
  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev / 1.5, TIMELINE_CONFIG.minScale));
  }, []);

  /**
   * 处理时间刻度点击
   * @param e - 鼠标事件
   */
  const handleRulerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollLeft;
    const time = (x / scale) * 1000;
    seekTo(Math.max(0, Math.min(time, totalDuration)));
  }, [scale, scrollLeft, seekTo, totalDuration]);

  /**
   * 处理播放头拖拽开始
   */
  const handlePlayheadDragStart = useCallback(() => {
    setIsDraggingPlayhead(true);
  }, []);

  /**
   * 监听全局鼠标事件
   * 处理播放头拖拽移动和释放
   */
  useEffect(() => {
    if (isDraggingPlayhead) {
      const handleMouseMove = (e: MouseEvent) => {
        if (!rulerRef.current) return;
        const rect = rulerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left + scrollLeft;
        const time = (x / scale) * 1000;
        seekTo(Math.max(0, Math.min(time, totalDuration)));
      };
      
      const handleMouseUp = () => {
        setIsDraggingPlayhead(false);
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingPlayhead, scale, scrollLeft, seekTo, totalDuration]);

  /**
   * 处理滚动同步
   */
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollLeft(e.currentTarget.scrollLeft);
  }, []);

  /**
   * 格式化时间显示
   * @param ms - 毫秒数
   */
  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const frames = Math.floor((ms % 1000) / (1000 / 30)); // 假设 30fps
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  }, []);

  return (
    <div
      className="flex flex-col border-t border-white/5 bg-[#18181b] w-full overflow-hidden"
      style={{ height }}
    >
      {/* 时间线头部工具栏 */}
      <div className="flex h-12 items-center justify-between border-b border-white/5 px-4 bg-white/5 backdrop-blur-sm flex-shrink-0">
        {/* 左侧 - 播放控制 */}
        <div className="flex items-center gap-3">
          {/* 播放控制按钮组 */}
          <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1 border border-white/5">
            <button
              onClick={handleSkipBack}
              className="flex h-7 w-7 items-center justify-center rounded text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              title={t('timeline.skipBack')}
              aria-label={t('timeline.skipBack')}
            >
              <SkipBack className="h-4 w-4" />
            </button>
            
            <button
              onClick={handlePlayPause}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-600 text-white transition-all hover:bg-primary-500 hover:shadow-[0_0_10px_rgba(14,165,233,0.4)]"
              title={isPlaying ? t('timeline.pause') : t('timeline.play')}
              aria-label={isPlaying ? t('timeline.pause') : t('timeline.play')}
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 ml-0.5 fill-current" />}
            </button>
            
            <button
              onClick={handleStop}
              className="flex h-7 w-7 items-center justify-center rounded text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              title={t('timeline.stop')}
              aria-label={t('timeline.stop')}
            >
              <Square className="h-4 w-4 fill-current" />
            </button>
            
            <button
              onClick={handleSkipForward}
              className="flex h-7 w-7 items-center justify-center rounded text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              title={t('timeline.skipForward')}
              aria-label={t('timeline.skipForward')}
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>
          
          {/* 当前时间显示 */}
          <div className="flex items-center gap-2 rounded-lg bg-black/40 border border-white/5 px-3 py-1.5 font-mono">
            <span className="text-sm text-primary-400 font-bold text-glow">
              {formatTime(currentTime)}
            </span>
            <span className="text-xs text-slate-600">/</span>
            <span className="text-xs text-slate-500">
              {formatTime(totalDuration)}
            </span>
          </div>
        </div>
        
        {/* 中间 - 标题 */}
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-slate-300 tracking-wide uppercase text-[10px]">
            {t('timeline.title')}
          </h3>
          <span className="rounded-full bg-white/5 border border-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400">
            {tracks.length} {t('timeline.tracks')}
          </span>
        </div>
        
        {/* 右侧 - 缩放和折叠 */}
        <div className="flex items-center gap-3">
          {/* 缩放控制 */}
          <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1 border border-white/5">
            <button
              onClick={handleZoomOut}
              className="flex h-7 w-7 items-center justify-center rounded text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              title={t('timeline.zoomOut')}
              aria-label={t('timeline.zoomOut')}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            
            <span className="w-14 text-center text-xs text-slate-400 font-mono">
              {Math.round(scale)}px/s
            </span>
            
            <button
              onClick={handleZoomIn}
              className="flex h-7 w-7 items-center justify-center rounded text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              title={t('timeline.zoomIn')}
              aria-label={t('timeline.zoomIn')}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          
          {/* 折叠按钮 */}
          <button
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            title={isCollapsed ? t('timeline.expand') : t('timeline.collapse')}
            aria-label={isCollapsed ? t('timeline.expand') : t('timeline.collapse')}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      {/* 时间线内容区域 - 折叠时隐藏 */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            className="flex flex-1 overflow-hidden bg-[#09090b]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* 左侧轨道标签区域 */}
            <div 
              className="flex flex-col border-r border-white/5 bg-[#18181b]"
              style={{ width: TIMELINE_CONFIG.labelWidth }}
            >
              {/* 空白区域对齐时间刻度 */}
              <div 
                className="flex items-center justify-between border-b border-white/5 px-3 bg-white/5"
                style={{ height: TIMELINE_CONFIG.rulerHeight }}
              >
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {t('timeline.tracks')}
                </span>
                <button
                  className="flex h-5 w-5 items-center justify-center rounded text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                  title={t('timeline.addTrack')}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              
              {/* 轨道标签列表 */}
              <div className="flex-1 overflow-y-auto scrollbar-thin custom-scrollbar">
                {tracks.map(track => (
                  <TrackLabel
                    key={track.id}
                    track={track}
                    height={TIMELINE_CONFIG.trackHeight}
                    isSelected={selectedTracks.includes(track.id)}
                    onSelect={() => setSelectedTracks([track.id])}
                    onToggleLock={() => {/* TODO: 实现锁定切换 */}}
                    onToggleVisibility={() => {/* TODO: 实现可见性切换 */}}
                  />
                ))}
              </div>
            </div>
            
            {/* 右侧时间线区域 */}
            <div 
              ref={timelineRef}
              className="flex flex-1 flex-col overflow-x-auto overflow-y-hidden scrollbar-thin custom-scrollbar"
              onScroll={handleScroll}
            >
              {/* 时间刻度尺 */}
              <div 
                ref={rulerRef}
                className="relative cursor-pointer border-b border-white/5 bg-[#18181b]"
                style={{ 
                  height: TIMELINE_CONFIG.rulerHeight,
                  width: timelineWidth,
                  minWidth: '100%',
                }}
                onClick={handleRulerClick}
              >
                {/* 时间刻度标记 */}
                {timeMarkers.map((marker, index) => (
                  <div
                    key={index}
                    className="absolute top-0 flex flex-col items-center pointer-events-none"
                    style={{ left: (marker.time / 1000) * scale }}
                  >
                    <div 
                      className={`w-px ${marker.isMajor ? 'h-2.5 bg-slate-500' : 'h-1.5 bg-slate-700'}`}
                    />
                    {marker.label && (
                      <span className="mt-0.5 text-[10px] font-mono text-slate-500 select-none">
                        {marker.label}
                      </span>
                    )}
                  </div>
                ))}
                
                {/* 播放头 */}
                <div
                  className="absolute top-0 z-10 flex flex-col items-center group"
                  style={{ 
                    left: playheadPosition,
                    transform: 'translateX(-50%)',
                  }}
                  onMouseDown={handlePlayheadDragStart}
                >
                  {/* 播放头三角形 */}
                  <div 
                    className="h-0 w-0 cursor-ew-resize border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-primary-500 drop-shadow-[0_0_4px_rgba(14,165,233,0.5)] transition-transform group-hover:scale-110"
                  />
                </div>
              </div>
              
              {/* 轨道内容区域 */}
              <div 
                className="relative flex-1 bg-grid opacity-50"
                style={{ width: timelineWidth, minWidth: '100%' }}
              >
                {/* 播放头线条 */}
                <div
                  className="absolute top-0 bottom-0 z-10 w-px bg-primary-500 shadow-[0_0_4px_rgba(14,165,233,0.5)] pointer-events-none"
                  style={{ left: playheadPosition }}
                />
                
                {/* 轨道列表 */}
                {tracks.map(track => (
                  <TimelineTrack
                    key={track.id}
                    track={track}
                    scale={scale}
                    height={TIMELINE_CONFIG.trackHeight}
                    isSelected={selectedTracks.includes(track.id)}
                    selectedKeyframes={selectedKeyframes}
                    onKeyframeSelect={(keyframeId) => setSelectedKeyframes([keyframeId])}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EditorTimeline;
