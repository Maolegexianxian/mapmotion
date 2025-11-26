/**
 * 导出相关类型定义
 */
import type { UniqueId, Timestamp, Size } from './common';

/** 导出格式 */
export type ExportFormat = 'mp4' | 'webm' | 'gif' | 'png-sequence' | 'jpeg-sequence' | 'prores';

/** 分辨率预设 */
export type ExportResolutionPreset = '720p' | '1080p' | '2k' | '4k' | '9:16' | '1:1' | 'custom';

/** 质量预设 */
export type ExportQualityPreset = 'draft' | 'standard' | 'high' | 'best';

/** 帧率 */
export type ExportFrameRate = 24 | 25 | 30 | 50 | 60;

/** 水印位置 */
export type WatermarkPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

/** 导出任务状态 */
export type ExportJobStatus = 'queued' | 'preparing' | 'rendering' | 'encoding' | 'uploading' | 'success' | 'failed' | 'cancelled';

/** 导出范围 */
export interface ExportRange {
  type: 'full' | 'custom';
  startMs?: number;
  endMs?: number;
}

/** 水印配置 */
export interface WatermarkConfig {
  enabled: boolean;
  type: 'text' | 'image';
  text?: string;
  imageUrl?: string;
  position: WatermarkPosition;
  opacity: number;
  scale: number;
  margin: number;
}

/** 版权归属配置 */
export interface AttributionConfig {
  visible: boolean;
  position: 'overlay' | 'end-credits';
  customText?: string;
  showDataSources: boolean;
}

/** 音频导出配置 */
export interface AudioExportConfig {
  includeAudio: boolean;
  audioBitrate: number;
  volume: number;
  fadeInOut: boolean;
}

/** 导出配置 */
export interface ExportConfig {
  format: ExportFormat;
  resolutionPreset: ExportResolutionPreset;
  customResolution?: Size;
  qualityPreset: ExportQualityPreset;
  frameRate: ExportFrameRate;
  bitrate?: number;
  transparentBackground: boolean;
  range: ExportRange;
  watermark?: WatermarkConfig;
  attribution?: AttributionConfig;
  audio?: AudioExportConfig;
}

/** 导出错误 */
export interface ExportError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  retryable: boolean;
}

/** 导出任务 */
export interface ExportJob {
  id: UniqueId;
  projectId: UniqueId;
  sceneId?: UniqueId;
  config: ExportConfig;
  status: ExportJobStatus;
  progress: number;
  currentStep?: string;
  estimatedTimeRemaining?: number;
  resultUrl?: string;
  fileSize?: number;
  error?: ExportError;
  createdAt: Timestamp;
  startedAt?: Timestamp;
  finishedAt?: Timestamp;
}

/** 导出预设 */
export interface ExportPreset {
  id: string;
  name: string;
  description: string;
  config: Partial<ExportConfig>;
  icon?: string;
}

/** 默认导出预设列表 */
export const DEFAULT_EXPORT_PRESETS: ExportPreset[] = [
  {
    id: 'social-1080p',
    name: '社媒 1080p',
    description: '适用于社交媒体的标准高清视频',
    config: {
      format: 'mp4',
      resolutionPreset: '1080p',
      qualityPreset: 'high',
      frameRate: 30,
    },
  },
  {
    id: 'vertical-9-16',
    name: '竖屏 9:16',
    description: '适用于短视频平台的竖屏格式',
    config: {
      format: 'mp4',
      resolutionPreset: '9:16',
      qualityPreset: 'high',
      frameRate: 30,
    },
  },
  {
    id: 'high-quality-4k',
    name: '高清 4K',
    description: '最高质量的 4K 视频',
    config: {
      format: 'mp4',
      resolutionPreset: '4k',
      qualityPreset: 'best',
      frameRate: 30,
    },
  },
  {
    id: 'png-sequence',
    name: 'PNG 序列',
    description: '无损 PNG 图片序列，支持透明背景',
    config: {
      format: 'png-sequence',
      resolutionPreset: '1080p',
      qualityPreset: 'best',
      frameRate: 30,
      transparentBackground: true,
    },
  },
];
