/**
 * 时间线引擎
 * 管理动画播放、关键帧插值、时间控制
 */
import { Easing, getEasingFunction, type EasingType, type EasingFunction } from './Easing';

/** 关键帧接口 */
export interface Keyframe<T = unknown> {
  /** 时间点（毫秒） */
  time: number;
  /** 关键帧值 */
  value: T;
  /** 缓动类型 */
  easing?: EasingType;
  /** 自定义缓动函数 */
  easingFunction?: EasingFunction;
}

/** 动画轨道接口 */
export interface AnimationTrack<T = unknown> {
  /** 轨道 ID */
  id: string;
  /** 轨道名称 */
  name: string;
  /** 关键帧列表 */
  keyframes: Keyframe<T>[];
  /** 插值函数 */
  interpolator: (from: T, to: T, progress: number) => T;
  /** 值变化回调 */
  onUpdate?: (value: T) => void;
}

/** 时间线状态 */
export type TimelineState = 'idle' | 'playing' | 'paused' | 'seeking';

/** 时间线事件 */
export type TimelineEvent = 'play' | 'pause' | 'stop' | 'seek' | 'update' | 'complete' | 'loop';

/** 时间线事件回调 */
export type TimelineEventCallback = (data: { time: number; state: TimelineState }) => void;

/** 时间线配置 */
export interface TimelineConfig {
  /** 总时长（毫秒） */
  duration: number;
  /** 帧率 */
  fps?: number;
  /** 是否循环 */
  loop?: boolean;
  /** 播放速度 */
  speed?: number;
}

/**
 * TimelineEngine - 时间线引擎
 * 
 * 职责：
 * 1. 管理动画轨道和关键帧
 * 2. 控制播放状态
 * 3. 计算插值
 * 4. 精确时间控制
 */
export class TimelineEngine {
  /** 配置 */
  private config: Required<TimelineConfig>;
  
  /** 动画轨道映射 */
  private tracks: globalThis.Map<string, AnimationTrack> = new globalThis.Map();
  
  /** 当前播放状态 */
  private state: TimelineState = 'idle';
  
  /** 当前时间（毫秒） */
  private currentTime = 0;
  
  /** 上一帧时间戳 */
  private lastFrameTime = 0;
  
  /** 动画帧 ID */
  private animationFrameId: number | null = null;
  
  /** 事件监听器 */
  private eventListeners: globalThis.Map<TimelineEvent, Set<TimelineEventCallback>> = new globalThis.Map();
  
  /** 帧间隔（毫秒） */
  private frameInterval: number;

  /**
   * 构造函数
   * @param config - 时间线配置
   */
  constructor(config: TimelineConfig) {
    this.config = {
      duration: config.duration,
      fps: config.fps ?? 60,
      loop: config.loop ?? false,
      speed: config.speed ?? 1,
    };
    this.frameInterval = 1000 / this.config.fps;
  }

  /**
   * 添加动画轨道
   * @param track - 动画轨道
   */
  addTrack<T>(track: AnimationTrack<T>): void {
    // 按时间排序关键帧
    track.keyframes.sort((a, b) => a.time - b.time);
    this.tracks.set(track.id, track as AnimationTrack);
  }

  /**
   * 移除动画轨道
   * @param trackId - 轨道 ID
   */
  removeTrack(trackId: string): void {
    this.tracks.delete(trackId);
  }

  /**
   * 获取动画轨道
   * @param trackId - 轨道 ID
   */
  getTrack<T>(trackId: string): AnimationTrack<T> | undefined {
    return this.tracks.get(trackId) as AnimationTrack<T> | undefined;
  }

  /**
   * 开始播放
   */
  play(): void {
    if (this.state === 'playing') return;

    this.state = 'playing';
    this.lastFrameTime = performance.now();
    this.tick();
    this.emit('play');
  }

  /**
   * 暂停播放
   */
  pause(): void {
    if (this.state !== 'playing') return;

    this.state = 'paused';
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.emit('pause');
  }

  /**
   * 停止播放并重置
   */
  stop(): void {
    this.state = 'idle';
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.currentTime = 0;
    this.updateAllTracks();
    this.emit('stop');
  }

  /**
   * 跳转到指定时间
   * @param time - 目标时间（毫秒）
   */
  seek(time: number): void {
    const prevState = this.state;
    this.state = 'seeking';
    this.currentTime = Math.max(0, Math.min(time, this.config.duration));
    this.updateAllTracks();
    this.state = prevState === 'playing' ? 'playing' : 'idle';
    this.emit('seek');
  }

  /**
   * 设置播放速度
   * @param speed - 播放速度
   */
  setSpeed(speed: number): void {
    this.config.speed = Math.max(0.1, Math.min(speed, 10));
  }

  /**
   * 设置是否循环
   * @param loop - 是否循环
   */
  setLoop(loop: boolean): void {
    this.config.loop = loop;
  }

  /**
   * 获取当前时间
   */
  getCurrentTime(): number {
    return this.currentTime;
  }

  /**
   * 获取总时长
   */
  getDuration(): number {
    return this.config.duration;
  }

  /**
   * 获取播放进度 (0-1)
   */
  getProgress(): number {
    return this.currentTime / this.config.duration;
  }

  /**
   * 获取当前状态
   */
  getState(): TimelineState {
    return this.state;
  }

  /**
   * 添加事件监听器
   * @param event - 事件类型
   * @param callback - 回调函数
   */
  on(event: TimelineEvent, callback: TimelineEventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  /**
   * 移除事件监听器
   * @param event - 事件类型
   * @param callback - 回调函数
   */
  off(event: TimelineEvent, callback: TimelineEventCallback): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * 触发事件
   * @param event - 事件类型
   */
  private emit(event: TimelineEvent): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const data = { time: this.currentTime, state: this.state };
      listeners.forEach((callback) => callback(data));
    }
  }

  /**
   * 动画帧循环
   */
  private tick = (): void => {
    if (this.state !== 'playing') return;

    const now = performance.now();
    const delta = (now - this.lastFrameTime) * this.config.speed;

    // 帧率控制
    if (delta >= this.frameInterval) {
      this.lastFrameTime = now - (delta % this.frameInterval);
      this.currentTime += delta;

      // 检查是否播放完成
      if (this.currentTime >= this.config.duration) {
        if (this.config.loop) {
          this.currentTime = this.currentTime % this.config.duration;
          this.emit('loop');
        } else {
          this.currentTime = this.config.duration;
          this.updateAllTracks();
          this.state = 'idle';
          this.emit('complete');
          return;
        }
      }

      this.updateAllTracks();
      this.emit('update');
    }

    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  /**
   * 更新所有轨道
   */
  private updateAllTracks(): void {
    this.tracks.forEach((track) => {
      const value = this.interpolateTrack(track, this.currentTime);
      if (value !== undefined && track.onUpdate) {
        track.onUpdate(value);
      }
    });
  }

  /**
   * 计算轨道在指定时间的插值
   * @param track - 动画轨道
   * @param time - 时间（毫秒）
   */
  private interpolateTrack<T>(track: AnimationTrack<T>, time: number): T | undefined {
    const { keyframes, interpolator } = track;

    if (keyframes.length === 0) return undefined;
    if (keyframes.length === 1) return keyframes[0]!.value;

    // 找到当前时间所在的关键帧区间
    let fromIndex = 0;
    let toIndex = 1;

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (time >= keyframes[i]!.time && time <= keyframes[i + 1]!.time) {
        fromIndex = i;
        toIndex = i + 1;
        break;
      }
      if (time > keyframes[i + 1]!.time) {
        fromIndex = i + 1;
        toIndex = i + 1;
      }
    }

    const fromKeyframe = keyframes[fromIndex]!;
    const toKeyframe = keyframes[toIndex]!;

    // 如果是同一个关键帧
    if (fromIndex === toIndex) {
      return fromKeyframe.value;
    }

    // 计算线性进度
    const duration = toKeyframe.time - fromKeyframe.time;
    const elapsed = time - fromKeyframe.time;
    const linearProgress = Math.max(0, Math.min(1, elapsed / duration));

    // 应用缓动
    const easingFn = fromKeyframe.easingFunction || 
      (fromKeyframe.easing ? getEasingFunction(fromKeyframe.easing) : Easing.linear);
    const easedProgress = easingFn(linearProgress);

    // 插值
    return interpolator(fromKeyframe.value, toKeyframe.value, easedProgress);
  }

  /**
   * 销毁时间线引擎
   */
  destroy(): void {
    this.stop();
    this.tracks.clear();
    this.eventListeners.clear();
  }
}

/**
 * 数值插值器
 */
export function numberInterpolator(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

/**
 * 颜色插值器 (支持 #RRGGBB 格式)
 */
export function colorInterpolator(from: string, to: string, progress: number): string {
  const fromRgb = hexToRgb(from);
  const toRgb = hexToRgb(to);

  if (!fromRgb || !toRgb) return from;

  const r = Math.round(fromRgb.r + (toRgb.r - fromRgb.r) * progress);
  const g = Math.round(fromRgb.g + (toRgb.g - fromRgb.g) * progress);
  const b = Math.round(fromRgb.b + (toRgb.b - fromRgb.b) * progress);

  return rgbToHex(r, g, b);
}

/**
 * 数组插值器
 */
export function arrayInterpolator<T extends number[]>(from: T, to: T, progress: number): T {
  return from.map((v, i) => v + ((to[i] ?? 0) - v) * progress) as T;
}

/**
 * 对象插值器
 */
export function objectInterpolator<T extends Record<string, number>>(
  from: T,
  to: T,
  progress: number
): T {
  const result = { ...from };
  for (const key in from) {
    if (typeof from[key] === 'number' && typeof to[key] === 'number') {
      result[key] = (from[key] + (to[key] - from[key]) * progress) as T[typeof key];
    }
  }
  return result;
}

/** 辅助函数：十六进制转 RGB */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || !result[1] || !result[2] || !result[3]) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/** 辅助函数：RGB 转十六进制 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export default TimelineEngine;
