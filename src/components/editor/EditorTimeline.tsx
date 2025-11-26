/**
 * 编辑器时间线组件
 */
import { useState, useRef } from 'react';
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
} from 'lucide-react';

import { useProjectStore } from '@/stores/projectStore';

/** 时间线属性 */
interface EditorTimelineProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

/**
 * EditorTimeline - 时间线组件
 */
export function EditorTimeline({ isCollapsed, onToggle }: EditorTimelineProps) {
  const { t } = useTranslation();
  const { currentProject, currentSceneIndex } = useProjectStore();
  const currentScene = currentProject?.scenes[currentSceneIndex];

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  const totalDuration = currentScene?.durationMs ?? 10000;

  // 格式化时间
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const remainingMs = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${remainingMs.toString().padStart(2, '0')}`;
  };

  if (isCollapsed) {
    return (
      <div className="flex h-8 items-center justify-between border-t border-editor-border bg-editor-sidebar px-4">
        <span className="text-xs text-slate-400">{t('editor.panels.timeline')}</span>
        <button onClick={onToggle} className="btn-icon text-slate-400 hover:text-white">
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-48 flex-col border-t border-editor-border bg-editor-sidebar">
      {/* 时间线头部 */}
      <div className="flex items-center justify-between border-b border-editor-border px-4 py-2">
        {/* 播放控制 */}
        <div className="flex items-center gap-1">
          <button className="btn-icon text-slate-300 hover:text-white" title="回到开始">
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn-icon text-slate-300 hover:text-white"
            title={isPlaying ? t('common.pause') : t('common.play')}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button className="btn-icon text-slate-300 hover:text-white" title="到结尾">
            <SkipForward className="h-4 w-4" />
          </button>
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
          <button className="btn-icon text-slate-300 hover:text-white" title={t('editor.timeline.addItem')}>
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
        <div className="w-40 flex-shrink-0 border-r border-editor-border">
          <div className="flex h-6 items-center border-b border-editor-border px-2">
            <span className="text-xs text-slate-500">轨道</span>
          </div>
          {/* 轨道列表 */}
          <div className="p-2">
            <div className="rounded bg-editor-panel px-2 py-1.5 text-xs text-slate-400">
              镜头
            </div>
          </div>
        </div>

        {/* 时间线区域 */}
        <div ref={timelineRef} className="flex-1 overflow-x-auto">
          {/* 时间刻度 */}
          <div className="flex h-6 items-center border-b border-editor-border bg-editor-panel">
            {Array.from({ length: Math.ceil(totalDuration / 1000) + 1 }).map((_, i) => (
              <div
                key={i}
                className="relative flex-shrink-0"
                style={{ width: '100px' }}
              >
                <span className="absolute left-0 text-[10px] text-slate-500">
                  {formatTime(i * 1000)}
                </span>
              </div>
            ))}
          </div>

          {/* 轨道内容 */}
          <div className="relative min-h-[100px] bg-editor-panel/50">
            {/* 播放头 */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-primary-500"
              style={{ left: `${(currentTime / totalDuration) * 100}%` }}
            />

            {/* 时间线条目 */}
            {currentScene?.items.map((item) => (
              <div
                key={item.id}
                className="absolute top-2 h-8 rounded bg-primary-600/80 px-2 text-xs text-white"
                style={{
                  left: `${(item.startMs / totalDuration) * 100}%`,
                  width: `${(item.durationMs / totalDuration) * 100}%`,
                }}
              >
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditorTimeline;
