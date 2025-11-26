/**
 * 时间线相关类型定义
 * 定义时间线条目、动画、缓动等数据结构
 */

import type { UniqueId, GeoCoordinate, Color } from './common';
import type { CameraConfig } from './project';
import type { LabelConfig, PathAnimation } from './map';

/**
 * 时间线条目类型枚举
 */
export type TimelineItemType = 
  | 'camera'      // 镜头动画
  | 'path'        // 路径动画
  | 'label'       // 标签动画
  | 'marker'      // 标记动画
  | 'dataStyle'   // 数据样式动画
  | 'overlay'     // 覆盖层动画
  | 'audio';      // 音频

/**
 * 时间线条目基础接口
 */
export interface TimelineItem {
  /** 条目唯一标识 */
  id: UniqueId;
  /** 条目类型 */
  type: TimelineItemType;
  /** 条目名称 */
  name: string;
  /** 开始时间（毫秒） */
  startMs: number;
  /** 持续时间（毫秒） */
  durationMs: number;
  /** 缓动函数 */
  easing: EasingType;
  /** 是否锁定 */
  locked: boolean;
  /** 是否禁用 */
  disabled: boolean;
  /** 条目参数（根据类型不同） */
  params: TimelineItemParams;
}

/**
 * 时间线条目参数联合类型
 */
export type TimelineItemParams = 
  | CameraAnimationParams
  | PathAnimationParams
  | LabelAnimationParams
  | MarkerAnimationParams
  | DataStyleAnimationParams
  | OverlayAnimationParams
  | AudioParams;

/**
 * 镜头动画参数
 */
export interface CameraAnimationParams {
  /** 动画动作类型 */
  action: CameraAction;
  /** 起始相机配置 */
  from?: CameraConfig;
  /** 目标相机配置 */
  to?: CameraConfig;
  /** 动画强度 (0-1) */
  strength: number;
  /** 是否使用弹性动画 */
  elastic?: boolean;
  /** 速度曲线 */
  curve?: AnimationCurve;
}

/**
 * 镜头动作类型枚举
 */
export type CameraAction = 
  | 'static'        // 静止
  | 'flyTo'         // 飞向目标点
  | 'dollyIn'       // 推进
  | 'dollyOut'      // 拉远
  | 'panLeft'       // 左移
  | 'panRight'      // 右移
  | 'panUp'         // 上移
  | 'panDown'       // 下移
  | 'orbit'         // 环绕
  | 'tiltUp'        // 仰视
  | 'tiltDown'      // 俯视
  | 'rotateLeft'    // 左转
  | 'rotateRight'   // 右转
  | 'zoomIn'        // 放大
  | 'zoomOut'       // 缩小
  | 'followPath';   // 跟随路径

/**
 * 路径动画参数
 */
export interface PathAnimationParams {
  /** 路径数据源 ID */
  sourceId: UniqueId;
  /** 路径坐标（或从数据源获取） */
  coordinates?: GeoCoordinate[];
  /** 移动速度（km/h） */
  speed?: number;
  /** 是否跟随路径方向 */
  followDirection: boolean;
  /** 是否显示完整路径 */
  showFullPath: boolean;
  /** 路径动画配置 */
  animation: PathAnimation;
  /** 相机跟随配置 */
  cameraFollow?: CameraFollowConfig;
}

/**
 * 相机跟随配置
 */
export interface CameraFollowConfig {
  /** 是否启用跟随 */
  enabled: boolean;
  /** 跟随距离 */
  distance: number;
  /** 跟随偏移 */
  offset?: [number, number];
  /** 跟随平滑度 */
  smoothness: number;
  /** 俯仰角 */
  pitch?: number;
  /** 缩放级别 */
  zoom?: number;
}

/**
 * 标签动画参数
 */
export interface LabelAnimationParams {
  /** 要素 ID */
  featureId: UniqueId;
  /** 标签配置 */
  label: LabelConfig;
  /** 入场动画 */
  enterAnimation: LabelAnimation;
  /** 出场动画 */
  exitAnimation?: LabelAnimation;
  /** 是否自动隐藏 */
  autoHide?: boolean;
}

/**
 * 标签动画类型枚举
 */
export type LabelAnimation = 
  | 'none'
  | 'fadeIn'
  | 'fadeOut'
  | 'slideIn'
  | 'slideOut'
  | 'scaleIn'
  | 'scaleOut'
  | 'bounceIn'
  | 'bounceOut'
  | 'typewriter';

/**
 * 标记动画参数
 */
export interface MarkerAnimationParams {
  /** 标记 ID */
  markerId: UniqueId;
  /** 动画类型 */
  animation: MarkerAnimation;
  /** 动画参数 */
  animationParams?: MarkerAnimationConfig;
}

/**
 * 标记动画类型枚举
 */
export type MarkerAnimation = 
  | 'none'
  | 'drop'
  | 'bounce'
  | 'pulse'
  | 'fadeIn'
  | 'fadeOut'
  | 'scaleIn'
  | 'scaleOut';

/**
 * 标记动画配置
 */
export interface MarkerAnimationConfig {
  /** 动画延迟（毫秒） */
  delay?: number;
  /** 弹跳高度 */
  bounceHeight?: number;
  /** 脉冲大小 */
  pulseScale?: number;
  /** 脉冲次数 */
  pulseCount?: number;
}

/**
 * 数据样式动画参数
 */
export interface DataStyleAnimationParams {
  /** 图层 ID */
  layerId: UniqueId;
  /** 样式属性动画 */
  styleTransitions: StyleTransition[];
}

/**
 * 样式过渡配置
 */
export interface StyleTransition {
  /** 样式属性名 */
  property: string;
  /** 起始值 */
  from: unknown;
  /** 目标值 */
  to: unknown;
  /** 过渡缓动 */
  easing?: EasingType;
}

/**
 * 覆盖层动画参数
 */
export interface OverlayAnimationParams {
  /** 覆盖层类型 */
  overlayType: OverlayType;
  /** 覆盖层配置 */
  config: OverlayConfig;
  /** 入场动画 */
  enterAnimation?: string;
  /** 出场动画 */
  exitAnimation?: string;
}

/**
 * 覆盖层类型枚举
 */
export type OverlayType = 
  | 'image'
  | 'video'
  | 'text'
  | 'logo'
  | 'watermark';

/**
 * 覆盖层配置
 */
export interface OverlayConfig {
  /** 资源 URL */
  url?: string;
  /** 文本内容 */
  text?: string;
  /** 位置 */
  position: OverlayPosition;
  /** 大小 */
  size?: { width: number; height: number };
  /** 透明度 */
  opacity: number;
  /** 样式 */
  style?: Record<string, unknown>;
}

/**
 * 覆盖层位置枚举
 */
export type OverlayPosition = 
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/**
 * 音频参数
 */
export interface AudioParams {
  /** 音频资源 ID */
  assetId: UniqueId;
  /** 音频 URL */
  url: string;
  /** 音量 (0-1) */
  volume: number;
  /** 是否循环 */
  loop: boolean;
  /** 淡入时长（毫秒） */
  fadeInMs?: number;
  /** 淡出时长（毫秒） */
  fadeOutMs?: number;
}

/**
 * 缓动函数类型枚举
 */
export type EasingType = 
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInQuart'
  | 'easeOutQuart'
  | 'easeInOutQuart'
  | 'easeInQuint'
  | 'easeOutQuint'
  | 'easeInOutQuint'
  | 'easeInSine'
  | 'easeOutSine'
  | 'easeInOutSine'
  | 'easeInExpo'
  | 'easeOutExpo'
  | 'easeInOutExpo'
  | 'easeInCirc'
  | 'easeOutCirc'
  | 'easeInOutCirc'
  | 'easeInBack'
  | 'easeOutBack'
  | 'easeInOutBack'
  | 'easeInElastic'
  | 'easeOutElastic'
  | 'easeInOutElastic'
  | 'easeInBounce'
  | 'easeOutBounce'
  | 'easeInOutBounce';

/**
 * 动画曲线类型
 */
export interface AnimationCurve {
  /** 曲线类型 */
  type: 'bezier' | 'spring' | 'custom';
  /** 贝塞尔曲线控制点 */
  bezier?: [number, number, number, number];
  /** 弹簧参数 */
  spring?: SpringConfig;
  /** 自定义关键帧 */
  keyframes?: AnimationKeyframe[];
}

/**
 * 弹簧配置
 */
export interface SpringConfig {
  /** 刚度 */
  stiffness: number;
  /** 阻尼 */
  damping: number;
  /** 质量 */
  mass: number;
  /** 速度 */
  velocity?: number;
}

/**
 * 动画关键帧
 */
export interface AnimationKeyframe {
  /** 时间进度 (0-1) */
  offset: number;
  /** 值进度 (0-1) */
  value: number;
  /** 缓动函数 */
  easing?: EasingType;
}

/**
 * 播放状态枚举
 */
export type PlaybackState = 'stopped' | 'playing' | 'paused';

/**
 * 时间线播放配置
 */
export interface PlaybackConfig {
  /** 播放状态 */
  state: PlaybackState;
  /** 当前时间（毫秒） */
  currentTimeMs: number;
  /** 播放速度 */
  playbackRate: number;
  /** 是否循环 */
  loop: boolean;
  /** 循环范围 */
  loopRange?: { startMs: number; endMs: number };
  /** 是否从当前位置播放 */
  fromCurrentPosition: boolean;
}

/**
 * 时间线轨道
 */
export interface TimelineTrack {
  /** 轨道 ID */
  id: UniqueId;
  /** 轨道名称 */
  name: string;
  /** 轨道类型 */
  type: TimelineItemType;
  /** 轨道颜色 */
  color: Color;
  /** 是否可见 */
  visible: boolean;
  /** 是否锁定 */
  locked: boolean;
  /** 轨道高度 */
  height: number;
}

/**
 * 时间线选择状态
 */
export interface TimelineSelection {
  /** 选中的条目 ID 列表 */
  itemIds: UniqueId[];
  /** 选择范围 */
  range?: { startMs: number; endMs: number };
}
