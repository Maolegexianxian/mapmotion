/**
 * Stores 模块导出
 * 集中导出所有状态管理 Store
 */
export { useProjectStore } from './projectStore';

export { useEditorStore, getHistoryManager, recordHistory } from './editorStore';
export type { EditorTool, SelectionType, SelectionItem, ViewMode, PanelState } from './editorStore';

export { useTimelineStore } from './timelineStore';
export type { PlaybackState, LoopMode } from './timelineStore';
