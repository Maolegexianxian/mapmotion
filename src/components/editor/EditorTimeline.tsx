/**
 * 编辑器时间线组件
 * 支持多轨道、关键帧编辑、播放控制
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronUp,
  ChevronDown,
  Plus,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  ZoomIn,
  ZoomOut,
  Scissors,
  Trash2,
} from 'lucide-react';

import { useProjectStore } from '@/stores/projectStore';
import { TimelineTrack, TrackLabel, type TrackData, type KeyframeData } from './TimelineTrack';

/** 时间线属性 */
interface EditorTimelineProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

/** 初始轨道数据 */
const initialTracks: TrackData[] = [
  {
    id: 'camera',
    name: '镜头',
    property: 'camera',
    color: '#3b82f6',
    keyframes: [
      { id: 'kf1', time: 0, value: { center: [116.4, 39.9], zoom: 10 } },
      { id: 'kf2', time: 3000, value: { center: [121.4, 31.2], zoom: 12 } },
      { id: 'kf3', time: 6000, value: { center: [113.2, 23.1], zoom: 11 } },
    ],
  },
  {
    id: 'markers',
    name: '标记',
    property: 'markers.opacity',
    color: '#ef4444',
    keyframes: [
      { id: 'kf4', time: 1000, value: 0 },
      { id: 'kf5', time: 2000, value: 1 },
    ],
  },
  {
    id: 'labels',
    name: '标签',
    property: 'labels.opacity',
    color: '#22c55e',
    keyframes: [
      { id: 'kf6', time: 2500, value: 0 },
      { id: 'kf7', time: 3500, value: 1 },
    ],
  },
];

/**
 * EditorTimeline - 时间线组件
 */
export function EditorTimeline({ isCollapsed, onToggle }: EditorTimelineProps) {
  const { t } = useTranslation();
  const { currentProject, currentSceneIndex } = useProjectStore();
  const currentScene = currentProject?.scenes[currentSceneIndex];

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [pixelsPerSecond, setPixelsPerSecond] = useState(100);
  const [tracks, setTracks] = useState<TrackData[]>(initialTracks);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [selectedKeyframeId, setSelectedKeyframeId] = useState<string | null>(null);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const playIntervalRef = useRef<number | null>(null);

  const totalDuration = currentScene?.durationMs ?? 10000;

  // 播放逻辑
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 16; // ~60fps
          if (next >= totalDuration) {
            if (isLooping) {
              return 0;
            } else {
              setIsPlaying(false);
              return totalDuration;
            }
          }
          return next;
        });
      }, 16);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    }
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, isLooping, totalDuration]);

  // 格式化时间
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const remainingMs = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${remainingMs.toString().padStart(2, '0')}`;
  };

  // 播放/暂停
  const handlePlayPause = useCallback(() => {
    if (currentTime >= totalDuration && !isPlaying) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  }, [currentTime, totalDuration, isPlaying]);

  // 跳转到开始
  const handleSkipBack = useCallback(() => {
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  // 跳转到结束
  const handleSkipForward = useCallback(() => {
    setCurrentTime(totalDuration);
    setIsPlaying(false);
  }, [totalDuration]);

  // 缩放控制
  const handleZoomIn = useCallback(() => {
    setPixelsPerSecond((prev) => Math.min(prev * 1.5, 400));
  }, []);

  const handleZoomOut = useCallback(() => {
    setPixelsPerSecond((prev) => Math.max(prev / 1.5, 25));
  }, []);

  // 选择轨道
  const handleSelectTrack = useCallback((trackId: string) => {
    setSelectedTrackId(trackId);
    setSelectedKeyframeId(null);
  }, []);

  // 选择关键帧
  const handleSelectKeyframe = useCallback((trackId: string, keyframeId: string) => {
    setSelectedTrackId(trackId);
    setSelectedKeyframeId(keyframeId);
  }, []);

  // 添加关键帧
  const handleAddKeyframe = useCallback((trackId: string, time?: number) => {
    const newKeyframe: KeyframeData = {
      id: `kf_${Date.now()}`,
      time: time ?? currentTime,
      value: null,
    };
    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId
          ? { ...track, keyframes: [...track.keyframes, newKeyframe].sort((a, b) => a.time - b.time) }
          : track
      )
    );
  }, [currentTime]);

  // 移动关键帧
  const handleMoveKeyframe = useCallback((trackId: string, keyframeId: string, newTime: number) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId
          ? {
              ...track,
              keyframes: track.keyframes
                .map((kf) => (kf.id === keyframeId ? { ...kf, time: newTime } : kf))
                .sort((a, b) => a.time - b.time),
            }
          : track
      )
    );
  }, []);

  // 删除关键帧
  const handleDeleteKeyframe = useCallback((trackId: string, keyframeId: string) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId
          ? { ...track, keyframes: track.keyframes.filter((kf) => kf.id !== keyframeId) }
          : track
      )
    );
    if (selectedKeyframeId === keyframeId) {
      setSelectedKeyframeId(null);
    }
  }, [selectedKeyframeId]);

  // 删除选中的关键帧
  const handleDeleteSelected = useCallback(() => {
    if (selectedTrackId && selectedKeyframeId) {
      handleDeleteKeyframe(selectedTrackId, selectedKeyframeId);
    }
  }, [selectedTrackId, selectedKeyframeId, handleDeleteKeyframe]);

  // 添加轨道
  const handleAddTrack = useCallback(() => {
    const newTrack: TrackData = {
      id: `track_${Date.now()}`,
      name: `轨道 ${tracks.length + 1}`,
      property: 'custom',
      color: ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'][tracks.length % 5] ?? '#3b82f6',
      keyframes: [],
    };
    setTracks((prev) => [...prev, newTrack]);
  }, [tracks.length]);

  // 时间线点击跳转
  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
    const trackWidth = (totalDuration / 1000) * pixelsPerSecond;
    const newTime = (x / trackWidth) * totalDuration;
    setCurrentTime(Math.max(0, Math.min(totalDuration, newTime)));
  }, [totalDuration, pixelsPerSecond]);

  const trackWidth = (totalDuration / 1000) * pixelsPerSecond;

  if (isCollapsed) {
    return (
      <div className="flex h-8 items-center justify-between border-t border-editor-border bg-editor-sidebar px-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{t('editor.panels.timeline')}</span>
          <span className="font-mono text-xs text-slate-500">{formatTime(currentTime)}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePlayPause}
            className="btn-icon text-slate-400 hover:text-white"
          >
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </button>
          <button onClick={onToggle} className="btn-icon text-slate-400 hover:text-white">
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-56 flex-col border-t border-editor-border bg-editor-sidebar">
      {/* 时间线头部 */}
      <div className="flex items-center justify-between border-b border-editor-border px-4 py-2">
        {/* 播放控制 */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleSkipBack}
            className="btn-icon text-slate-300 hover:text-white"
            title="回到开始"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            onClick={handlePlayPause}
            className="btn-icon text-slate-300 hover:text-white"
            title={isPlaying ? t('common.pause') : t('common.play')}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={handleSkipForward}
            className="btn-icon text-slate-300 hover:text-white"
            title="到结尾"
          >
            <SkipForward className="h-4 w-4" />
          </button>
          <div className="mx-2 h-4 w-px bg-editor-border" />
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`btn-icon ${isLooping ? 'text-primary-400' : 'text-slate-300'} hover:text-white`}
            title={t('editor.timeline.loop')}
          >
            <Repeat className="h-4 w-4" />
          </button>
        </div>

        {/* 时间显示 */}
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-slate-300">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </span>
        </div>

        {/* 右侧工具 */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="btn-icon text-slate-300 hover:text-white"
            title="缩小"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomIn}
            className="btn-icon text-slate-300 hover:text-white"
            title="放大"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <div className="mx-2 h-4 w-px bg-editor-border" />
          <button
            onClick={() => selectedTrackId && handleAddKeyframe(selectedTrackId)}
            className="btn-icon text-slate-300 hover:text-white"
            title="添加关键帧"
            disabled={!selectedTrackId}
          >
            <Scissors className="h-4 w-4" />
          </button>
          <button
            onClick={handleDeleteSelected}
            className="btn-icon text-slate-300 hover:text-white"
            title="删除选中"
            disabled={!selectedKeyframeId}
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="mx-2 h-4 w-px bg-editor-border" />
          <button
            onClick={handleAddTrack}
            className="btn-icon text-slate-300 hover:text-white"
            title={t('editor.timeline.addItem')}
          >
            <Plus className="h-4 w-4" />
          </button>
          <button onClick={onToggle} className="btn-icon text-slate-400 hover:text-white">
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 时间线内容 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 轨道标签 */}
        <div className="w-40 flex-shrink-0 border-r border-editor-border overflow-y-auto">
          <div className="flex h-6 items-center border-b border-editor-border px-2">
            <span className="text-xs text-slate-500">轨道</span>
          </div>
          {tracks.map((track) => (
            <TrackLabel
              key={track.id}
              track={track}
              isSelected={selectedTrackId === track.id}
              onSelect={() => handleSelectTrack(track.id)}
              onAddKeyframe={() => handleAddKeyframe(track.id)}
            />
          ))}
        </div>

        {/* 时间线区域 */}
        <div
          ref={timelineRef}
          className="flex-1 overflow-x-auto overflow-y-auto"
          onClick={handleTimelineClick}
        >
          {/* 时间刻度 */}
          <div
            className="sticky top-0 z-10 flex h-6 items-center border-b border-editor-border bg-editor-panel"
            style={{ width: `${trackWidth}px`, minWidth: '100%' }}
          >
            {Array.from({ length: Math.ceil(totalDuration / 1000) + 1 }).map((_, i) => (
              <div
                key={i}
                className="relative flex-shrink-0"
                style={{ width: `${pixelsPerSecond}px` }}
              >
                <span className="absolute left-1 text-[10px] text-slate-500">
                  {formatTime(i * 1000)}
                </span>
                {/* 小刻度 */}
                <div className="absolute bottom-0 left-0 h-2 w-px bg-slate-600" />
                {i < Math.ceil(totalDuration / 1000) && (
                  <>
                    <div
                      className="absolute bottom-0 h-1 w-px bg-slate-700"
                      style={{ left: `${pixelsPerSecond * 0.25}px` }}
                    />
                    <div
                      className="absolute bottom-0 h-1.5 w-px bg-slate-700"
                      style={{ left: `${pixelsPerSecond * 0.5}px` }}
                    />
                    <div
                      className="absolute bottom-0 h-1 w-px bg-slate-700"
                      style={{ left: `${pixelsPerSecond * 0.75}px` }}
                    />
                  </>
                )}
              </div>
            ))}
          </div>

          {/* 轨道区域 */}
          <div className="relative" style={{ width: `${trackWidth}px`, minWidth: '100%' }}>
            {/* 播放头 */}
            <div
              className="absolute top-0 bottom-0 z-20 w-0.5 bg-red-500 pointer-events-none"
              style={{ left: `${(currentTime / totalDuration) * trackWidth}px` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 bg-red-500 rotate-45" />
            </div>

            {/* 轨道列表 */}
            {tracks.map((track) => (
              <TimelineTrack
                key={track.id}
                track={track}
                duration={totalDuration}
                pixelsPerSecond={pixelsPerSecond}
                isSelected={selectedTrackId === track.id}
                selectedKeyframeId={selectedTrackId === track.id ? selectedKeyframeId : null}
                onSelectTrack={() => handleSelectTrack(track.id)}
                onSelectKeyframe={(kfId) => handleSelectKeyframe(track.id, kfId)}
                onAddKeyframe={(time) => handleAddKeyframe(track.id, time)}
                onMoveKeyframe={(kfId, time) => handleMoveKeyframe(track.id, kfId, time)}
                onDeleteKeyframe={(kfId) => handleDeleteKeyframe(track.id, kfId)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditorTimeline;
