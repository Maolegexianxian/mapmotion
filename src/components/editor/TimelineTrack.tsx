/**
 * 时间线轨道组件
 * 提供关键帧编辑功能
 */
import { useRef, useCallback, useMemo } from 'react';
import { Diamond, Plus } from 'lucide-react';
import { useDrag } from '@/hooks';

/** 关键帧数据 */
export interface KeyframeData {
  id: string;
  time: number;
  value: unknown;
  easing?: string;
}

/** 轨道数据 */
export interface TrackData {
  id: string;
  name: string;
  property: string;
  keyframes: KeyframeData[];
  color?: string;
}

/** 时间线轨道属性 */
interface TimelineTrackProps {
  track: TrackData;
  duration: number;
  currentTime?: number; // 预留给播放头位置
  pixelsPerSecond: number;
  isSelected: boolean;
  selectedKeyframeId: string | null;
  onSelectTrack: () => void;
  onSelectKeyframe: (id: string) => void;
  onAddKeyframe: (time: number) => void;
  onMoveKeyframe: (id: string, newTime: number) => void;
  onDeleteKeyframe: (id: string) => void;
}

/**
 * TimelineTrack - 时间线轨道
 */
export function TimelineTrack({
  track,
  duration,
  // currentTime, // 预留给播放头位置
  pixelsPerSecond,
  isSelected,
  selectedKeyframeId,
  onSelectTrack,
  onSelectKeyframe,
  onAddKeyframe,
  onMoveKeyframe,
  onDeleteKeyframe,
}: TimelineTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const trackWidth = (duration / 1000) * pixelsPerSecond;

  // 双击添加关键帧
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = (x / trackWidth) * duration;
      onAddKeyframe(Math.max(0, Math.min(duration, time)));
    },
    [duration, trackWidth, onAddKeyframe]
  );

  return (
    <div
      ref={trackRef}
      className={`
        relative h-8 border-b border-editor-border
        ${isSelected ? 'bg-editor-hover' : 'bg-editor-panel/30'}
      `}
      style={{ width: `${trackWidth}px`, minWidth: '100%' }}
      onClick={onSelectTrack}
      onDoubleClick={handleDoubleClick}
    >
      {/* 关键帧 */}
      {track.keyframes.map((keyframe) => (
        <KeyframeMarker
          key={keyframe.id}
          keyframe={keyframe}
          duration={duration}
          trackWidth={trackWidth}
          isSelected={selectedKeyframeId === keyframe.id}
          color={track.color || '#3b82f6'}
          onSelect={() => onSelectKeyframe(keyframe.id)}
          onMove={(newTime) => onMoveKeyframe(keyframe.id, newTime)}
          onDelete={() => onDeleteKeyframe(keyframe.id)}
        />
      ))}

      {/* 关键帧之间的连线 */}
      {track.keyframes.length > 1 && (
        <KeyframeConnections
          keyframes={track.keyframes}
          duration={duration}
          trackWidth={trackWidth}
          color={track.color || '#3b82f6'}
        />
      )}
    </div>
  );
}

/** 关键帧标记 */
interface KeyframeMarkerProps {
  keyframe: KeyframeData;
  duration: number;
  trackWidth: number;
  isSelected: boolean;
  color?: string;
  onSelect: () => void;
  onMove: (newTime: number) => void;
  onDelete: () => void;
}

function KeyframeMarker({
  keyframe,
  duration,
  trackWidth,
  isSelected,
  color = '#3b82f6',
  onSelect,
  onMove,
  onDelete,
}: KeyframeMarkerProps) {
  const position = (keyframe.time / duration) * trackWidth;

  // 拖拽功能
  const { state: dragState, dragProps } = useDrag(
    { axis: 'x' },
    {
      onDrag: (state) => {
        const newPosition = position + state.delta.x;
        const newTime = (newPosition / trackWidth) * duration;
        onMove(Math.max(0, Math.min(duration, newTime)));
      },
    }
  );

  // 键盘删除
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDelete();
      }
    },
    [onDelete]
  );

  return (
    <div
      className={`
        absolute top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer
        ${dragState.isDragging ? 'z-10' : ''}
      `}
      style={{ left: `${position}px` }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      {...dragProps}
    >
      <Diamond
        className={`h-4 w-4 transition-transform ${
          isSelected ? 'scale-125' : 'hover:scale-110'
        }`}
        style={{ color, fill: isSelected ? color : 'transparent' }}
      />
    </div>
  );
}

/** 关键帧连线 */
interface KeyframeConnectionsProps {
  keyframes: KeyframeData[];
  duration: number;
  trackWidth: number;
  color?: string;
}

function KeyframeConnections({
  keyframes,
  duration,
  trackWidth,
  color = '#3b82f6',
}: KeyframeConnectionsProps) {
  const sorted = useMemo(
    () => [...keyframes].sort((a, b) => a.time - b.time),
    [keyframes]
  );

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: `${trackWidth}px` }}
    >
      {sorted.slice(0, -1).map((kf, i) => {
        const next = sorted[i + 1];
        if (!next) return null;
        
        const x1 = (kf.time / duration) * trackWidth;
        const x2 = (next.time / duration) * trackWidth;
        
        return (
          <line
            key={kf.id}
            x1={x1}
            y1="50%"
            x2={x2}
            y2="50%"
            stroke={color}
            strokeWidth="2"
            opacity="0.5"
          />
        );
      })}
    </svg>
  );
}

/** 时间线轨道标签 */
interface TrackLabelProps {
  track: TrackData;
  isSelected: boolean;
  onSelect: () => void;
  onAddKeyframe: () => void;
}

export function TrackLabel({ track, isSelected, onSelect, onAddKeyframe }: TrackLabelProps) {
  return (
    <div
      className={`
        group flex h-8 items-center justify-between border-b border-editor-border px-2
        ${isSelected ? 'bg-editor-hover' : 'hover:bg-editor-hover/50'}
      `}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: track.color || '#3b82f6' }}
        />
        <span className="text-xs text-slate-300 truncate max-w-[100px]">
          {track.name}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddKeyframe();
        }}
        className="p-1 text-slate-500 opacity-0 group-hover:opacity-100 hover:text-white"
        title="添加关键帧"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}

export default TimelineTrack;
