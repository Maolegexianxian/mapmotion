/**
 * 编辑器工具栏组件
 * 提供常用工具和操作按钮
 */
import { useTranslation } from 'react-i18next';
import {
  MousePointer,
  Hand,
  MapPin,
  Minus,
  Hexagon,
  Type,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Ruler,
  Magnet,
  Play,
  Pause,
  Square,
  Repeat,
} from 'lucide-react';
import { useEditorStore, type EditorTool } from '@/stores/editorStore';

/** 工具配置 */
interface ToolConfig {
  id: EditorTool;
  icon: typeof MousePointer;
  labelKey: string;
  shortcut: string;
}

/** 工具列表 */
const TOOLS: ToolConfig[] = [
  { id: 'select', icon: MousePointer, labelKey: 'editor.tools.select', shortcut: 'V' },
  { id: 'pan', icon: Hand, labelKey: 'editor.tools.pan', shortcut: 'H' },
  { id: 'draw-point', icon: MapPin, labelKey: 'editor.tools.point', shortcut: 'P' },
  { id: 'draw-line', icon: Minus, labelKey: 'editor.tools.line', shortcut: 'L' },
  { id: 'draw-polygon', icon: Hexagon, labelKey: 'editor.tools.polygon', shortcut: 'R' },
  { id: 'label', icon: Type, labelKey: 'editor.tools.label', shortcut: 'T' },
];

/**
 * EditorToolbar - 编辑器工具栏
 */
export function EditorToolbar() {
  const { t } = useTranslation();
  const {
    currentTool,
    setTool,
    undo,
    redo,
    zoomIn,
    zoomOut,
    resetZoom,
    zoom,
    showGrid,
    showRulers,
    snapEnabled,
    toggleGrid,
    toggleRulers,
    toggleSnap,
    isPlaying,
    isLooping,
    togglePlay,
    stop,
    toggleLoop,
  } = useEditorStore();

  return (
    <div className="flex items-center gap-1 p-2 bg-white dark:bg-editor-panel border-b border-slate-200 dark:border-editor-border">
      {/* 工具组 */}
      <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-editor-border pr-2 mr-2">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = currentTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setTool(tool.id)}
              title={`${t(tool.labelKey)} (${tool.shortcut})`}
              className={`
                p-2 rounded transition-colors
                ${isActive 
                  ? 'bg-primary-500 text-white' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-editor-hover'
                }
              `}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* 撤销/重做 */}
      <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-editor-border pr-2 mr-2">
        <button
          onClick={undo}
          title={`${t('editor.actions.undo')} (Ctrl+Z)`}
          className="p-2 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-editor-hover transition-colors disabled:opacity-50"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          title={`${t('editor.actions.redo')} (Ctrl+Shift+Z)`}
          className="p-2 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-editor-hover transition-colors disabled:opacity-50"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* 缩放控制 */}
      <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-editor-border pr-2 mr-2">
        <button
          onClick={zoomOut}
          title={`${t('editor.actions.zoomOut')} (Ctrl+-)`}
          className="p-2 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-editor-hover transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="px-2 min-w-[60px] text-center text-sm text-slate-600 dark:text-slate-400">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={zoomIn}
          title={`${t('editor.actions.zoomIn')} (Ctrl++)`}
          className="p-2 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-editor-hover transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={resetZoom}
          title={`${t('editor.actions.fitView')} (Ctrl+0)`}
          className="p-2 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-editor-hover transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* 视图选项 */}
      <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-editor-border pr-2 mr-2">
        <button
          onClick={toggleGrid}
          title={t('editor.view.grid')}
          className={`
            p-2 rounded transition-colors
            ${showGrid 
              ? 'bg-slate-200 dark:bg-editor-hover text-slate-700 dark:text-slate-300' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-editor-hover'
            }
          `}
        >
          <Grid className="w-4 h-4" />
        </button>
        <button
          onClick={toggleRulers}
          title={t('editor.view.rulers')}
          className={`
            p-2 rounded transition-colors
            ${showRulers 
              ? 'bg-slate-200 dark:bg-editor-hover text-slate-700 dark:text-slate-300' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-editor-hover'
            }
          `}
        >
          <Ruler className="w-4 h-4" />
        </button>
        <button
          onClick={toggleSnap}
          title={t('editor.view.snap')}
          className={`
            p-2 rounded transition-colors
            ${snapEnabled 
              ? 'bg-slate-200 dark:bg-editor-hover text-slate-700 dark:text-slate-300' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-editor-hover'
            }
          `}
        >
          <Magnet className="w-4 h-4" />
        </button>
      </div>

      {/* 播放控制 */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={togglePlay}
          title={isPlaying ? t('editor.playback.pause') : t('editor.playback.play')}
          className="p-2 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-editor-hover transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={stop}
          title={t('editor.playback.stop')}
          className="p-2 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-editor-hover transition-colors"
        >
          <Square className="w-4 h-4" />
        </button>
        <button
          onClick={toggleLoop}
          title={t('editor.playback.loop')}
          className={`
            p-2 rounded transition-colors
            ${isLooping 
              ? 'bg-slate-200 dark:bg-editor-hover text-slate-700 dark:text-slate-300' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-editor-hover'
            }
          `}
        >
          <Repeat className="w-4 h-4" />
        </button>
      </div>

      {/* 右侧空间 */}
      <div className="flex-1" />
    </div>
  );
}

export default EditorToolbar;
