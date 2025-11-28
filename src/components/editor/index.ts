/**
 * 编辑器组件导出
 * 
 * @description
 * 编辑器模块包含以下核心组件：
 * - 布局组件：EditorLayout, EditorHeader, EditorSidebar 等
 * - 功能组件：画布、时间线、属性面板等
 * - 辅助组件：快捷操作、欢迎引导等
 */

// 主布局组件
export { EditorLayout } from './EditorLayout';
export { EditorHeader } from './EditorHeader';
export { EditorSidebar } from './EditorSidebar';
export { EditorCanvas } from './EditorCanvas';
export { EditorTimeline } from './EditorTimeline';
export { EditorProperties } from './EditorProperties';
export { EditorToolbar } from './EditorToolbar';
export { EditorShortcuts } from './EditorShortcuts';

// 快捷操作和引导
export { QuickActionsBar } from './QuickActionsBar';
export { WelcomeOverlay } from './WelcomeOverlay';

// 图层相关
export { LayerPanel } from './LayerPanel';
export type { LayerItem, LayerType } from './LayerPanel';

// 属性相关
export { PropertyEditor } from './PropertyEditor';
export type { PropertyGroup, PropertyItem } from './PropertyEditor';

// 时间线相关
export { TimelineTrack, TrackLabel } from './TimelineTrack';
export type { KeyframeData, TrackData } from './TimelineTrack';

// 对话框
export { AddLayerModal } from './AddLayerModal';
export { ExportDialog } from './ExportDialog';
export type { ExportOptions } from './ExportDialog';
export { DataImportDialog } from './DataImportDialog';

// 搜索
export { SearchPanel } from './SearchPanel';
export type { SearchResult } from './SearchPanel';

// 样式选择
export { StyleSelector } from './StyleSelector';
