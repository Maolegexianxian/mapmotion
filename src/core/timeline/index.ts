/**
 * 时间线模块导出
 */
export { TimelineEngine } from './TimelineEngine';
export type {
  Keyframe,
  AnimationTrack,
  TimelineState,
  TimelineEvent,
  TimelineEventCallback,
  TimelineConfig,
} from './TimelineEngine';

export {
  numberInterpolator,
  colorInterpolator,
  arrayInterpolator,
  objectInterpolator,
} from './TimelineEngine';

export { Easing, getEasingFunction, cubicBezier, BezierPresets } from './Easing';
export type { EasingFunction, EasingType } from './Easing';
