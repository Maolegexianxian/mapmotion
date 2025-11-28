/**
 * 路径动画引擎
 * 
 * @description
 * 管理路径动画效果，包括：
 * - 路径绘制动画
 * - 移动点动画
 * - 轨迹尾部效果
 * - 路径跟随相机
 * 
 * @module services/PathAnimationEngine
 */

import * as turf from '@turf/turf';
import type { GeoCoordinate } from '@/types/common';
import type { PathAnimation } from '@/types/map';

/**
 * 路径动画配置
 */
export interface PathAnimationConfig {
  /** 路径坐标数组 */
  path: GeoCoordinate[];
  /** 动画时长（毫秒） */
  duration: number;
  /** 是否显示完整路径 */
  showFullPath: boolean;
  /** 是否显示移动点 */
  showMovingPoint: boolean;
  /** 是否显示轨迹尾部 */
  showTrail: boolean;
  /** 轨迹长度（占总长度的比例，0-1） */
  trailLength: number;
  /** 路径颜色 */
  pathColor: string;
  /** 轨迹颜色 */
  trailColor: string;
  /** 移动点颜色 */
  pointColor: string;
  /** 路径宽度 */
  pathWidth: number;
  /** 移动点大小 */
  pointSize: number;
  /** 是否循环 */
  loop: boolean;
  /** 移动速度（km/h，可选，用于计算时长） */
  speed?: number;
}

/**
 * 路径动画状态
 */
export interface PathAnimationState {
  /** 当前进度 (0-1) */
  progress: number;
  /** 当前位置 */
  currentPosition: GeoCoordinate;
  /** 当前方向角（度） */
  bearing: number;
  /** 已走过的距离（米） */
  distanceTraveled: number;
  /** 剩余距离（米） */
  distanceRemaining: number;
  /** 可见路径段（已走过的部分） */
  visiblePath: GeoCoordinate[];
  /** 轨迹尾部路径 */
  trailPath: GeoCoordinate[];
  /** 是否完成 */
  isComplete: boolean;
}

/**
 * 路径上的点
 */
export interface PathPoint {
  /** 坐标 */
  coordinate: GeoCoordinate;
  /** 距离起点的距离（米） */
  distance: number;
  /** 进度 (0-1) */
  progress: number;
  /** 方向角（度） */
  bearing: number;
}

/**
 * 路径段信息
 */
interface PathSegment {
  /** 起点索引 */
  startIndex: number;
  /** 终点索引 */
  endIndex: number;
  /** 起点距离 */
  startDistance: number;
  /** 终点距离 */
  endDistance: number;
  /** 段长度 */
  length: number;
}

/**
 * 路径动画引擎类
 * 
 * @description
 * 提供路径动画的计算和状态管理
 * 
 * @example
 * ```typescript
 * const engine = new PathAnimationEngine({
 *   path: routeCoordinates,
 *   duration: 5000,
 *   showTrail: true,
 *   trailLength: 0.2
 * });
 * 
 * // 获取动画状态
 * const state = engine.getStateAtProgress(0.5);
 * ```
 */
export class PathAnimationEngine {
  /** 动画配置 */
  private config: PathAnimationConfig;
  
  /** 路径总长度（米） */
  private totalLength: number = 0;
  
  /** 各段累计距离 */
  private segmentDistances: number[] = [];
  
  /** 路径段信息 */
  private segments: PathSegment[] = [];
  
  /** 预计算的采样点 */
  private sampledPoints: PathPoint[] = [];
  
  /** 采样分辨率 */
  private readonly sampleResolution = 1000;

  /**
   * 构造函数
   * 
   * @param config - 动画配置
   */
  constructor(config: Partial<PathAnimationConfig> & { path: GeoCoordinate[] }) {
    this.config = {
      path: config.path,
      duration: config.duration ?? 5000,
      showFullPath: config.showFullPath ?? false,
      showMovingPoint: config.showMovingPoint ?? true,
      showTrail: config.showTrail ?? true,
      trailLength: config.trailLength ?? 0.15,
      pathColor: config.pathColor ?? '#3B82F6',
      trailColor: config.trailColor ?? '#60A5FA',
      pointColor: config.pointColor ?? '#EF4444',
      pathWidth: config.pathWidth ?? 4,
      pointSize: config.pointSize ?? 12,
      loop: config.loop ?? false,
    };

    // 条件设置可选属性
    if (config.speed !== undefined) {
      this.config.speed = config.speed;
    }

    this.initializePath();
  }

  /**
   * 初始化路径数据
   */
  private initializePath(): void {
    const { path } = this.config;
    
    if (path.length < 2) {
      console.warn('[PathAnimationEngine] 路径至少需要 2 个点');
      return;
    }

    // 计算各段长度和累计距离
    this.segmentDistances = [0];
    let accumulatedDistance = 0;

    for (let i = 0; i < path.length - 1; i++) {
      const segmentLength = this.calculateDistance(path[i]!, path[i + 1]!);
      accumulatedDistance += segmentLength;
      this.segmentDistances.push(accumulatedDistance);

      this.segments.push({
        startIndex: i,
        endIndex: i + 1,
        startDistance: accumulatedDistance - segmentLength,
        endDistance: accumulatedDistance,
        length: segmentLength,
      });
    }

    this.totalLength = accumulatedDistance;

    // 如果提供了速度，计算时长
    if (this.config.speed && this.config.speed > 0) {
      const speedMps = (this.config.speed * 1000) / 3600; // km/h 转 m/s
      this.config.duration = (this.totalLength / speedMps) * 1000;
    }

    // 预采样路径点
    this.presamplePath();
  }

  /**
   * 预采样路径点以提高运行时性能
   */
  private presamplePath(): void {
    this.sampledPoints = [];
    
    for (let i = 0; i <= this.sampleResolution; i++) {
      const progress = i / this.sampleResolution;
      const point = this.calculatePointAtProgress(progress);
      this.sampledPoints.push(point);
    }
  }

  /**
   * 计算指定进度处的点信息
   */
  private calculatePointAtProgress(progress: number): PathPoint {
    const { path } = this.config;
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const targetDistance = this.totalLength * clampedProgress;

    // 查找所在段
    let segmentIndex = 0;
    for (let i = 0; i < this.segments.length; i++) {
      if (targetDistance <= this.segments[i]!.endDistance) {
        segmentIndex = i;
        break;
      }
      segmentIndex = i;
    }

    const segment = this.segments[segmentIndex]!;
    const segmentProgress = segment.length > 0
      ? (targetDistance - segment.startDistance) / segment.length
      : 0;

    const startPoint = path[segment.startIndex]!;
    const endPoint = path[segment.endIndex]!;

    // 插值坐标
    const coordinate: GeoCoordinate = {
      longitude: this.lerp(startPoint.longitude, endPoint.longitude, segmentProgress),
      latitude: this.lerp(startPoint.latitude, endPoint.latitude, segmentProgress),
    };

    // 计算方向
    const bearing = this.calculateBearing(startPoint, endPoint);

    return {
      coordinate,
      distance: targetDistance,
      progress: clampedProgress,
      bearing,
    };
  }

  /**
   * 获取指定进度的动画状态
   * 
   * @param progress - 进度 (0-1)
   * @returns 动画状态
   */
  public getStateAtProgress(progress: number): PathAnimationState {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    
    // 使用预采样数据快速查找
    const sampleIndex = Math.round(clampedProgress * this.sampleResolution);
    const currentPoint = this.sampledPoints[sampleIndex] ?? this.calculatePointAtProgress(clampedProgress);

    // 计算可见路径
    const visiblePath = this.getVisiblePath(clampedProgress);
    
    // 计算轨迹尾部
    const trailPath = this.getTrailPath(clampedProgress);

    return {
      progress: clampedProgress,
      currentPosition: currentPoint.coordinate,
      bearing: currentPoint.bearing,
      distanceTraveled: currentPoint.distance,
      distanceRemaining: this.totalLength - currentPoint.distance,
      visiblePath,
      trailPath,
      isComplete: clampedProgress >= 1,
    };
  }

  /**
   * 获取指定时间的动画状态
   * 
   * @param timeMs - 时间（毫秒）
   * @returns 动画状态
   */
  public getStateAtTime(timeMs: number): PathAnimationState {
    let progress = timeMs / this.config.duration;
    
    // 处理循环
    if (this.config.loop && progress > 1) {
      progress = progress % 1;
    }

    return this.getStateAtProgress(progress);
  }

  /**
   * 获取可见路径（已走过的部分）
   */
  private getVisiblePath(progress: number): GeoCoordinate[] {
    const { path } = this.config;
    
    if (this.config.showFullPath) {
      return [...path];
    }

    if (progress <= 0) {
      return [];
    }

    const targetDistance = this.totalLength * progress;
    const result: GeoCoordinate[] = [];

    // 添加起点
    result.push(path[0]!);

    // 添加中间点
    for (let i = 0; i < this.segments.length; i++) {
      const segment = this.segments[i]!;
      
      if (segment.endDistance <= targetDistance) {
        // 整段都在可见范围内
        result.push(path[segment.endIndex]!);
      } else if (segment.startDistance < targetDistance) {
        // 部分在可见范围内，需要插值
        const segmentProgress = (targetDistance - segment.startDistance) / segment.length;
        const startPoint = path[segment.startIndex]!;
        const endPoint = path[segment.endIndex]!;
        
        result.push({
          longitude: this.lerp(startPoint.longitude, endPoint.longitude, segmentProgress),
          latitude: this.lerp(startPoint.latitude, endPoint.latitude, segmentProgress),
        });
        break;
      } else {
        break;
      }
    }

    return result;
  }

  /**
   * 获取轨迹尾部路径
   */
  private getTrailPath(progress: number): GeoCoordinate[] {
    if (!this.config.showTrail || progress <= 0) {
      return [];
    }

    const trailStartProgress = Math.max(0, progress - this.config.trailLength);
    const trailEndProgress = progress;

    return this.getPathBetweenProgress(trailStartProgress, trailEndProgress);
  }

  /**
   * 获取两个进度之间的路径段
   */
  private getPathBetweenProgress(startProgress: number, endProgress: number): GeoCoordinate[] {
    const { path } = this.config;
    const result: GeoCoordinate[] = [];

    const startDistance = this.totalLength * startProgress;
    const endDistance = this.totalLength * endProgress;

    // 添加起点
    const startPoint = this.getPointAtDistance(startDistance);
    result.push(startPoint.coordinate);

    // 添加中间的完整顶点
    for (let i = 0; i < this.segments.length; i++) {
      const segment = this.segments[i]!;
      
      if (segment.startDistance > startDistance && segment.startDistance < endDistance) {
        result.push(path[segment.startIndex]!);
      }
      if (segment.endDistance > startDistance && segment.endDistance < endDistance) {
        result.push(path[segment.endIndex]!);
      }
    }

    // 添加终点
    const endPoint = this.getPointAtDistance(endDistance);
    result.push(endPoint.coordinate);

    return result;
  }

  /**
   * 根据距离获取点
   */
  private getPointAtDistance(distance: number): PathPoint {
    const progress = this.totalLength > 0 ? distance / this.totalLength : 0;
    return this.calculatePointAtProgress(progress);
  }

  /**
   * 获取路径上的等距采样点
   * 
   * @param count - 采样点数量
   * @returns 采样点数组
   */
  public getSampledPoints(count: number): PathPoint[] {
    const points: PathPoint[] = [];
    
    for (let i = 0; i <= count; i++) {
      const progress = i / count;
      points.push(this.calculatePointAtProgress(progress));
    }
    
    return points;
  }

  /**
   * 获取路径总长度（米）
   */
  public getTotalLength(): number {
    return this.totalLength;
  }

  /**
   * 获取动画时长（毫秒）
   */
  public getDuration(): number {
    return this.config.duration;
  }

  /**
   * 获取配置
   */
  public getConfig(): Readonly<PathAnimationConfig> {
    return { ...this.config };
  }

  /**
   * 更新配置
   * 
   * @param updates - 配置更新
   */
  public updateConfig(updates: Partial<PathAnimationConfig>): void {
    Object.assign(this.config, updates);
    
    // 如果路径变化，重新初始化
    if (updates.path) {
      this.initializePath();
    }
  }

  /**
   * 创建 PathAnimation 对象（用于 MapLibre 样式）
   */
  public createPathAnimation(): PathAnimation {
    return {
      showTrail: this.config.showTrail,
      trailLength: this.config.trailLength,
      trailColor: this.config.trailColor,
      showMovingPoint: this.config.showMovingPoint,
      movingPointSize: this.config.pointSize,
    };
  }

  /**
   * 生成 GeoJSON 线要素
   * 
   * @param progress - 当前进度
   * @returns GeoJSON Feature
   */
  public toGeoJSONLine(progress: number): GeoJSON.Feature<GeoJSON.LineString> {
    const state = this.getStateAtProgress(progress);
    
    return {
      type: 'Feature',
      properties: {
        progress,
        distance: state.distanceTraveled,
      },
      geometry: {
        type: 'LineString',
        coordinates: state.visiblePath.map(p => [p.longitude, p.latitude]),
      },
    };
  }

  /**
   * 生成移动点的 GeoJSON 要素
   * 
   * @param progress - 当前进度
   * @returns GeoJSON Feature
   */
  public toGeoJSONPoint(progress: number): GeoJSON.Feature<GeoJSON.Point> {
    const state = this.getStateAtProgress(progress);
    
    return {
      type: 'Feature',
      properties: {
        progress,
        bearing: state.bearing,
        distance: state.distanceTraveled,
      },
      geometry: {
        type: 'Point',
        coordinates: [state.currentPosition.longitude, state.currentPosition.latitude],
      },
    };
  }

  /**
   * 计算两点间距离（米）
   */
  private calculateDistance(from: GeoCoordinate, to: GeoCoordinate): number {
    const point1 = turf.point([from.longitude, from.latitude]);
    const point2 = turf.point([to.longitude, to.latitude]);
    return turf.distance(point1, point2, { units: 'meters' });
  }

  /**
   * 计算方向角（度）
   */
  private calculateBearing(from: GeoCoordinate, to: GeoCoordinate): number {
    const point1 = turf.point([from.longitude, from.latitude]);
    const point2 = turf.point([to.longitude, to.latitude]);
    return turf.bearing(point1, point2);
  }

  /**
   * 线性插值
   */
  private lerp(from: number, to: number, t: number): number {
    return from + (to - from) * t;
  }

  /**
   * 平滑路径
   * 
   * @param resolution - 平滑分辨率
   * @returns 平滑后的路径
   */
  public smoothPath(resolution = 100): GeoCoordinate[] {
    const { path } = this.config;
    
    if (path.length < 3) {
      return [...path];
    }

    const line = turf.lineString(path.map(p => [p.longitude, p.latitude]));
    const bezier = turf.bezierSpline(line, { resolution });
    
    return bezier.geometry.coordinates.map(coord => ({
      longitude: coord[0]!,
      latitude: coord[1]!,
    }));
  }

  /**
   * 简化路径
   * 
   * @param tolerance - 简化容差
   * @returns 简化后的路径
   */
  public simplifyPath(tolerance = 0.0001): GeoCoordinate[] {
    const { path } = this.config;
    
    if (path.length < 3) {
      return [...path];
    }

    const line = turf.lineString(path.map(p => [p.longitude, p.latitude]));
    const simplified = turf.simplify(line, { tolerance, highQuality: true });
    
    return simplified.geometry.coordinates.map(coord => ({
      longitude: coord[0]!,
      latitude: coord[1]!,
    }));
  }

  /**
   * 获取路径边界框
   */
  public getBounds(): { west: number; south: number; east: number; north: number } {
    const { path } = this.config;
    
    if (path.length === 0) {
      return { west: 0, south: 0, east: 0, north: 0 };
    }

    let west = Infinity;
    let south = Infinity;
    let east = -Infinity;
    let north = -Infinity;

    for (const point of path) {
      west = Math.min(west, point.longitude);
      south = Math.min(south, point.latitude);
      east = Math.max(east, point.longitude);
      north = Math.max(north, point.latitude);
    }

    return { west, south, east, north };
  }

  /**
   * 反转路径方向
   */
  public reverse(): void {
    this.config.path = [...this.config.path].reverse();
    this.initializePath();
  }

  /**
   * 克隆引擎实例
   */
  public clone(): PathAnimationEngine {
    return new PathAnimationEngine({
      ...this.config,
      path: [...this.config.path],
    });
  }
}

export default PathAnimationEngine;
