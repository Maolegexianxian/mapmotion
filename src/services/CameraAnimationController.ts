/**
 * 相机动画控制器
 * 
 * @description
 * 管理地图相机的动画效果，包括：
 * - 推进/拉远（Dolly）
 * - 环绕（Orbit）
 * - 俯仰（Tilt）
 * - 旋转（Rotate）
 * - 平移（Pan）
 * - 飞向目标（FlyTo）
 * - 路径跟随
 * 
 * @module services/CameraAnimationController
 */

import type { CameraState, GeoCoordinate } from '@/types/common';
import type { CameraAction } from '@/types/timeline';
import { getEasingFunction, type EasingType } from '@/core/timeline/Easing';

/**
 * 相机动画配置
 */
export interface CameraAnimationConfig {
  /** 动画动作类型 */
  action: CameraAction;
  /** 起始相机状态 */
  from: CameraState;
  /** 目标相机状态 */
  to: CameraState;
  /** 动画时长（毫秒） */
  duration: number;
  /** 缓动类型 */
  easing: EasingType;
  /** 动画强度 (0-1) */
  strength?: number;
  /** 环绕圈数（仅 orbit 动作） */
  orbitRevolutions?: number;
  /** 是否启用弹性效果 */
  elastic?: boolean;
}

/**
 * 相机关键帧
 */
export interface CameraKeyframe {
  /** 时间点（毫秒） */
  time: number;
  /** 相机状态 */
  state: CameraState;
  /** 缓动类型 */
  easing?: EasingType;
}

/**
 * 相机动画类型常量
 */
export type CameraAnimationType = CameraAction;

/**
 * 预设相机动画配置
 */
interface CameraAnimationPreset {
  /** 预设名称 */
  name: string;
  /** 描述 */
  description: string;
  /** 创建动画配置的函数 */
  create: (from: CameraState, options?: Partial<CameraAnimationConfig>) => Partial<CameraAnimationConfig>;
}

/**
 * 预设动画库
 */
const ANIMATION_PRESETS: Record<CameraAction, CameraAnimationPreset> = {
  static: {
    name: '静止',
    description: '相机保持静止',
    create: (from) => ({
      action: 'static',
      from,
      to: from,
    }),
  },
  flyTo: {
    name: '飞向目标',
    description: '相机平滑飞向目标位置',
    create: (from, options) => ({
      action: 'flyTo',
      from,
      to: options?.to ?? from,
      easing: 'easeInOutCubic',
    }),
  },
  dollyIn: {
    name: '推进',
    description: '相机向前推进，放大视野',
    create: (from, options) => {
      const strength = options?.strength ?? 0.5;
      const zoomDelta = 2 * strength;
      return {
        action: 'dollyIn',
        from,
        to: {
          ...from,
          zoom: Math.min(22, from.zoom + zoomDelta),
        },
        easing: 'easeOutCubic',
      };
    },
  },
  dollyOut: {
    name: '拉远',
    description: '相机向后拉远，缩小视野',
    create: (from, options) => {
      const strength = options?.strength ?? 0.5;
      const zoomDelta = 2 * strength;
      return {
        action: 'dollyOut',
        from,
        to: {
          ...from,
          zoom: Math.max(0, from.zoom - zoomDelta),
        },
        easing: 'easeOutCubic',
      };
    },
  },
  panLeft: {
    name: '左移',
    description: '相机向左平移',
    create: (from, options) => {
      const strength = options?.strength ?? 0.5;
      const offset = 0.1 * strength * Math.pow(2, 18 - from.zoom);
      return {
        action: 'panLeft',
        from,
        to: {
          ...from,
          center: {
            longitude: from.center.longitude - offset,
            latitude: from.center.latitude,
          },
        },
        easing: 'easeInOutSine',
      };
    },
  },
  panRight: {
    name: '右移',
    description: '相机向右平移',
    create: (from, options) => {
      const strength = options?.strength ?? 0.5;
      const offset = 0.1 * strength * Math.pow(2, 18 - from.zoom);
      return {
        action: 'panRight',
        from,
        to: {
          ...from,
          center: {
            longitude: from.center.longitude + offset,
            latitude: from.center.latitude,
          },
        },
        easing: 'easeInOutSine',
      };
    },
  },
  panUp: {
    name: '上移',
    description: '相机向上平移',
    create: (from, options) => {
      const strength = options?.strength ?? 0.5;
      const offset = 0.05 * strength * Math.pow(2, 18 - from.zoom);
      return {
        action: 'panUp',
        from,
        to: {
          ...from,
          center: {
            longitude: from.center.longitude,
            latitude: Math.min(85, from.center.latitude + offset),
          },
        },
        easing: 'easeInOutSine',
      };
    },
  },
  panDown: {
    name: '下移',
    description: '相机向下平移',
    create: (from, options) => {
      const strength = options?.strength ?? 0.5;
      const offset = 0.05 * strength * Math.pow(2, 18 - from.zoom);
      return {
        action: 'panDown',
        from,
        to: {
          ...from,
          center: {
            longitude: from.center.longitude,
            latitude: Math.max(-85, from.center.latitude - offset),
          },
        },
        easing: 'easeInOutSine',
      };
    },
  },
  orbit: {
    name: '环绕',
    description: '相机绕中心点旋转',
    create: (from, options) => {
      const strength = options?.strength ?? 0.5;
      const revolutions = options?.orbitRevolutions ?? 1;
      const bearingDelta = 360 * revolutions * strength;
      return {
        action: 'orbit',
        from,
        to: {
          ...from,
          bearing: (from.bearing + bearingDelta) % 360,
        },
        easing: 'linear',
      };
    },
  },
  tiltUp: {
    name: '仰视',
    description: '相机向上倾斜，减小俯仰角',
    create: (from, options) => {
      const strength = options?.strength ?? 0.5;
      const pitchDelta = 30 * strength;
      return {
        action: 'tiltUp',
        from,
        to: {
          ...from,
          pitch: Math.max(0, from.pitch - pitchDelta),
        },
        easing: 'easeOutCubic',
      };
    },
  },
  tiltDown: {
    name: '俯视',
    description: '相机向下倾斜，增加俯仰角',
    create: (from, options) => {
      const strength = options?.strength ?? 0.5;
      const pitchDelta = 30 * strength;
      return {
        action: 'tiltDown',
        from,
        to: {
          ...from,
          pitch: Math.min(85, from.pitch + pitchDelta),
        },
        easing: 'easeOutCubic',
      };
    },
  },
  rotateLeft: {
    name: '左转',
    description: '相机向左旋转',
    create: (from, options) => {
      const strength = options?.strength ?? 0.5;
      const bearingDelta = 45 * strength;
      return {
        action: 'rotateLeft',
        from,
        to: {
          ...from,
          bearing: (from.bearing - bearingDelta + 360) % 360,
        },
        easing: 'easeInOutSine',
      };
    },
  },
  rotateRight: {
    name: '右转',
    description: '相机向右旋转',
    create: (from, options) => {
      const strength = options?.strength ?? 0.5;
      const bearingDelta = 45 * strength;
      return {
        action: 'rotateRight',
        from,
        to: {
          ...from,
          bearing: (from.bearing + bearingDelta) % 360,
        },
        easing: 'easeInOutSine',
      };
    },
  },
  zoomIn: {
    name: '放大',
    description: '相机放大视野',
    create: (from, options) => {
      const strength = options?.strength ?? 0.5;
      const zoomDelta = 1.5 * strength;
      return {
        action: 'zoomIn',
        from,
        to: {
          ...from,
          zoom: Math.min(22, from.zoom + zoomDelta),
        },
        easing: 'easeOutQuad',
      };
    },
  },
  zoomOut: {
    name: '缩小',
    description: '相机缩小视野',
    create: (from, options) => {
      const strength = options?.strength ?? 0.5;
      const zoomDelta = 1.5 * strength;
      return {
        action: 'zoomOut',
        from,
        to: {
          ...from,
          zoom: Math.max(0, from.zoom - zoomDelta),
        },
        easing: 'easeOutQuad',
      };
    },
  },
  followPath: {
    name: '跟随路径',
    description: '相机跟随指定路径移动',
    create: (from) => ({
      action: 'followPath',
      from,
      to: from,
    }),
  },
};

/**
 * 相机动画控制器类
 * 
 * @description
 * 提供相机动画的创建、计算和管理功能
 * 
 * @example
 * ```typescript
 * const controller = new CameraAnimationController();
 * 
 * // 创建推进动画
 * const animation = controller.createAnimation('dollyIn', currentCamera, {
 *   duration: 2000,
 *   strength: 0.8
 * });
 * 
 * // 计算中间状态
 * const midState = controller.interpolate(animation, 0.5);
 * ```
 */
export class CameraAnimationController {
  /** 当前动画配置 */
  private currentAnimation: CameraAnimationConfig | null = null;

  /**
   * 创建相机动画配置
   * 
   * @param action - 动画动作类型
   * @param from - 起始相机状态
   * @param options - 动画选项
   * @returns 完整的动画配置
   */
  public createAnimation(
    action: CameraAction,
    from: CameraState,
    options: Partial<CameraAnimationConfig> = {}
  ): CameraAnimationConfig {
    const preset = ANIMATION_PRESETS[action];
    const presetConfig = preset.create(from, options);

    const animation: CameraAnimationConfig = {
      action,
      from,
      to: options.to ?? presetConfig.to ?? from,
      duration: options.duration ?? 2000,
      easing: options.easing ?? presetConfig.easing ?? 'easeInOutCubic',
      strength: options.strength ?? presetConfig.strength ?? 0.5,
    };

    if (options.orbitRevolutions !== undefined) {
      animation.orbitRevolutions = options.orbitRevolutions;
    }
    if (options.elastic !== undefined) {
      animation.elastic = options.elastic;
    }

    this.currentAnimation = animation;
    return animation;
  }

  /**
   * 计算动画在指定进度时的相机状态
   * 
   * @param config - 动画配置
   * @param progress - 进度 (0-1)
   * @returns 插值后的相机状态
   */
  public interpolate(config: CameraAnimationConfig, progress: number): CameraState {
    // 获取缓动函数
    const easingFn = getEasingFunction(config.easing);
    const easedProgress = easingFn(Math.max(0, Math.min(1, progress)));

    // 特殊处理环绕动画
    if (config.action === 'orbit') {
      return this.interpolateOrbit(config, easedProgress);
    }

    // 标准插值
    return this.interpolateCameraState(config.from, config.to, easedProgress);
  }

  /**
   * 标准相机状态插值
   */
  private interpolateCameraState(
    from: CameraState,
    to: CameraState,
    progress: number
  ): CameraState {
    return {
      center: this.interpolateCoordinate(from.center, to.center, progress),
      zoom: this.lerp(from.zoom, to.zoom, progress),
      pitch: this.lerp(from.pitch, to.pitch, progress),
      bearing: this.interpolateBearing(from.bearing, to.bearing, progress),
    };
  }

  /**
   * 坐标插值
   */
  private interpolateCoordinate(
    from: GeoCoordinate,
    to: GeoCoordinate,
    progress: number
  ): GeoCoordinate {
    // 处理经度跨日期变更线的情况
    let fromLng = from.longitude;
    let toLng = to.longitude;

    // 如果经度差超过 180 度，调整
    if (toLng - fromLng > 180) {
      fromLng += 360;
    } else if (fromLng - toLng > 180) {
      toLng += 360;
    }

    let longitude = this.lerp(fromLng, toLng, progress);
    // 标准化经度到 -180 到 180
    if (longitude > 180) longitude -= 360;
    if (longitude < -180) longitude += 360;

    return {
      longitude,
      latitude: this.lerp(from.latitude, to.latitude, progress),
    };
  }

  /**
   * 方位角插值（处理环绕）
   */
  private interpolateBearing(from: number, to: number, progress: number): number {
    // 找到最短旋转路径
    let delta = to - from;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    let result = from + delta * progress;
    // 标准化到 0-360
    while (result < 0) result += 360;
    while (result >= 360) result -= 360;

    return result;
  }

  /**
   * 环绕动画插值
   */
  private interpolateOrbit(config: CameraAnimationConfig, progress: number): CameraState {
    const { from, to, orbitRevolutions = 1, strength = 1 } = config;
    
    // 计算总旋转角度
    let totalRotation = to.bearing - from.bearing;
    if (orbitRevolutions > 0) {
      totalRotation = 360 * orbitRevolutions * strength;
    }

    const currentBearing = (from.bearing + totalRotation * progress) % 360;

    return {
      center: from.center,
      zoom: this.lerp(from.zoom, to.zoom, progress),
      pitch: this.lerp(from.pitch, to.pitch, progress),
      bearing: currentBearing < 0 ? currentBearing + 360 : currentBearing,
    };
  }

  /**
   * 线性插值
   */
  private lerp(from: number, to: number, progress: number): number {
    return from + (to - from) * progress;
  }

  /**
   * 从关键帧列表创建动画序列
   * 
   * @param keyframes - 关键帧数组
   * @returns 包含多个动画配置的数组
   */
  public createAnimationSequence(keyframes: CameraKeyframe[]): CameraAnimationConfig[] {
    if (keyframes.length < 2) {
      return [];
    }

    const animations: CameraAnimationConfig[] = [];

    for (let i = 0; i < keyframes.length - 1; i++) {
      const from = keyframes[i]!;
      const to = keyframes[i + 1]!;

      animations.push({
        action: 'flyTo',
        from: from.state,
        to: to.state,
        duration: to.time - from.time,
        easing: from.easing ?? 'easeInOutCubic',
      });
    }

    return animations;
  }

  /**
   * 计算两个相机状态之间的过渡动画
   * 
   * @param from - 起始状态
   * @param to - 目标状态
   * @param duration - 动画时长
   * @returns 动画配置
   */
  public createTransition(
    from: CameraState,
    to: CameraState,
    duration: number
  ): CameraAnimationConfig {
    return {
      action: 'flyTo',
      from,
      to,
      duration,
      easing: 'easeInOutCubic',
    };
  }

  /**
   * 计算相机跟随路径时的状态
   * 
   * @param path - 路径坐标数组
   * @param progress - 进度 (0-1)
   * @param options - 跟随选项
   * @returns 相机状态
   */
  public calculatePathFollowState(
    path: GeoCoordinate[],
    progress: number,
    options: {
      /** 基础缩放级别 */
      zoom?: number;
      /** 俯仰角 */
      pitch?: number;
      /** 是否朝向移动方向 */
      faceDirection?: boolean;
      /** 前方偏移（进度单位） */
      lookAhead?: number;
    } = {}
  ): CameraState {
    const {
      zoom = 14,
      pitch = 45,
      faceDirection = true,
      lookAhead = 0.01,
    } = options;

    if (path.length < 2) {
      return {
        center: path[0] ?? { longitude: 0, latitude: 0 },
        zoom,
        pitch,
        bearing: 0,
      };
    }

    // 获取当前位置
    const currentIndex = Math.min(
      Math.floor(progress * (path.length - 1)),
      path.length - 2
    );
    const nextIndex = currentIndex + 1;
    const segmentProgress = (progress * (path.length - 1)) % 1;

    const currentPoint = path[currentIndex]!;
    const nextPoint = path[nextIndex]!;

    // 插值当前位置
    const center: GeoCoordinate = {
      longitude: this.lerp(currentPoint.longitude, nextPoint.longitude, segmentProgress),
      latitude: this.lerp(currentPoint.latitude, nextPoint.latitude, segmentProgress),
    };

    // 计算方向
    let bearing = 0;
    if (faceDirection) {
      // 获取前方的点用于计算方向
      const aheadProgress = Math.min(1, progress + lookAhead);
      const aheadIndex = Math.min(
        Math.floor(aheadProgress * (path.length - 1)),
        path.length - 1
      );
      const aheadPoint = path[aheadIndex]!;

      bearing = this.calculateBearing(center, aheadPoint);
    }

    return {
      center,
      zoom,
      pitch,
      bearing,
    };
  }

  /**
   * 计算两点之间的方位角
   */
  private calculateBearing(from: GeoCoordinate, to: GeoCoordinate): number {
    const lat1 = (from.latitude * Math.PI) / 180;
    const lat2 = (to.latitude * Math.PI) / 180;
    const dLng = ((to.longitude - from.longitude) * Math.PI) / 180;

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    bearing = (bearing + 360) % 360;

    return bearing;
  }

  /**
   * 获取所有可用的动画预设
   */
  public getPresets(): Array<{ action: CameraAction; name: string; description: string }> {
    return Object.entries(ANIMATION_PRESETS).map(([action, preset]) => ({
      action: action as CameraAction,
      name: preset.name,
      description: preset.description,
    }));
  }

  /**
   * 获取当前动画配置
   */
  public getCurrentAnimation(): CameraAnimationConfig | null {
    return this.currentAnimation;
  }

  /**
   * 清除当前动画
   */
  public clearAnimation(): void {
    this.currentAnimation = null;
  }

  /**
   * 估算两个相机状态之间的动画时长
   * 
   * @param from - 起始状态
   * @param to - 目标状态
   * @returns 建议的动画时长（毫秒）
   */
  public estimateDuration(from: CameraState, to: CameraState): number {
    // 计算各维度变化量
    const zoomDelta = Math.abs(to.zoom - from.zoom);
    const pitchDelta = Math.abs(to.pitch - from.pitch);
    const bearingDelta = Math.abs(to.bearing - from.bearing);

    // 计算中心点距离
    const centerDistance = this.calculateDistance(from.center, to.center);

    // 基于变化量估算时长
    const baseDuration = 500;
    const zoomDuration = zoomDelta * 200;
    const pitchDuration = pitchDelta * 20;
    const bearingDuration = bearingDelta * 5;
    const distanceDuration = Math.min(centerDistance * 0.01, 3000);

    return Math.max(
      baseDuration,
      Math.round(baseDuration + zoomDuration + pitchDuration + bearingDuration + distanceDuration)
    );
  }

  /**
   * 计算两点之间的距离（米）
   */
  private calculateDistance(from: GeoCoordinate, to: GeoCoordinate): number {
    const R = 6371000; // 地球半径（米）
    const lat1 = (from.latitude * Math.PI) / 180;
    const lat2 = (to.latitude * Math.PI) / 180;
    const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
    const dLng = ((to.longitude - from.longitude) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

export default CameraAnimationController;
