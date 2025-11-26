/**
 * 核心模块统一导出
 */

// 地图引擎
export { MapEngine, LayerManager } from './map';
export type { MapEngineConfig, MapEventType, MapEventCallback } from './map';

// 时间线引擎
export {
  TimelineEngine,
  Easing,
  getEasingFunction,
  cubicBezier,
  BezierPresets,
  numberInterpolator,
  colorInterpolator,
  arrayInterpolator,
  objectInterpolator,
} from './timeline';
export type {
  Keyframe,
  AnimationTrack,
  TimelineState,
  TimelineEvent,
  TimelineEventCallback,
  TimelineConfig,
  EasingFunction,
  EasingType,
} from './timeline';

// 数据导入
export { DataImporter } from './data';
export type {
  ImportDataType,
  ImportResult,
  ImportedFeature,
  CSVParseOptions,
} from './data';

// 视频导出
export { VideoExporter } from './export';
export type {
  ExportConfig,
  ExportState,
  ProgressCallback,
  FrameRenderCallback,
} from './export';

// 标签系统
export { LabelRenderer, CollisionDetector, LabelManager } from './label';
export type {
  LabelRenderOptions,
  RenderedLabel,
  BoundingBox,
  LabelCandidate,
  CollisionConfig,
  CollisionResult,
  LabelData,
  CoordinateProjector,
  LabelManagerConfig,
} from './label';

// 历史记录
export { HistoryManager } from './history';
export type {
  HistoryEntry,
  HistoryConfig,
  HistoryEvent,
  HistoryEventCallback,
} from './history';
