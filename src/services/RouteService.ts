/**
 * 路线规划服务
 * 
 * @description
 * 提供路线规划和导航功能，包括：
 * - 多种出行方式路线规划（驾车、步行、骑行）
 * - 大圆航线计算
 * - 途经点支持
 * - 路线几何平滑处理
 * 
 * @module services/RouteService
 */

import * as turf from '@turf/turf';
import type { GeoCoordinate, BoundingBox } from '@/types/common';
import type { PathType } from '@/types/map';

/**
 * 路线规划选项
 */
export interface RouteOptions {
  /** 起点坐标 */
  origin: GeoCoordinate;
  /** 终点坐标 */
  destination: GeoCoordinate;
  /** 途经点列表 */
  waypoints?: GeoCoordinate[];
  /** 出行方式 */
  travelMode: PathType;
  /** 是否返回备选路线 */
  alternatives?: boolean;
  /** 避开选项 */
  avoid?: RouteAvoidOption[];
  /** 是否优化途经点顺序 */
  optimizeWaypoints?: boolean;
  /** 大圆航线分段数（仅 flight/greatCircle 模式） */
  greatCircleSegments?: number;
}

/**
 * 路线避开选项
 */
export type RouteAvoidOption = 'tolls' | 'highways' | 'ferries' | 'unpaved';

/**
 * 路线途经点
 */
export interface RouteWaypoint {
  /** 坐标 */
  coordinate: GeoCoordinate;
  /** 名称 */
  name?: string;
  /** 到达该点的距离（米） */
  distanceFromStart: number;
  /** 到达该点的时间（秒） */
  durationFromStart: number;
}

/**
 * 路线步骤
 */
export interface RouteStep {
  /** 步骤几何坐标 */
  geometry: GeoCoordinate[];
  /** 距离（米） */
  distance: number;
  /** 预计时间（秒） */
  duration: number;
  /** 导航指令 */
  instruction?: string;
  /** 道路名称 */
  roadName?: string;
  /** 转向方向 */
  maneuver?: RouteManeuver;
}

/**
 * 转向动作类型
 */
export type RouteManeuver =
  | 'straight'
  | 'slight-left'
  | 'slight-right'
  | 'left'
  | 'right'
  | 'sharp-left'
  | 'sharp-right'
  | 'u-turn'
  | 'merge'
  | 'exit'
  | 'roundabout'
  | 'arrive'
  | 'depart';

/**
 * 路线响应
 */
export interface RouteResponse {
  /** 路线几何坐标（完整） */
  geometry: GeoCoordinate[];
  /** 总距离（米） */
  distance: number;
  /** 预计总时间（秒） */
  duration: number;
  /** 边界框 */
  bounds: BoundingBox;
  /** 途经点信息 */
  waypoints: RouteWaypoint[];
  /** 路线步骤 */
  steps: RouteStep[];
  /** 路线摘要 */
  summary: string;
  /** 出行方式 */
  travelMode: PathType;
  /** 备选路线 */
  alternatives?: RouteResponse[];
}

/**
 * OSRM API 响应类型
 */
interface OSRMRoute {
  distance: number;
  duration: number;
  geometry: {
    coordinates: number[][];
    type: string;
  };
  legs: Array<{
    distance: number;
    duration: number;
    summary: string;
    steps: Array<{
      distance: number;
      duration: number;
      geometry: {
        coordinates: number[][];
      };
      maneuver: {
        type: string;
        modifier?: string;
        instruction?: string;
      };
      name: string;
    }>;
  }>;
}

interface OSRMResponse {
  code: string;
  routes: OSRMRoute[];
  waypoints: Array<{
    hint: string;
    distance: number;
    name: string;
    location: [number, number];
  }>;
}

/**
 * 缓存条目
 */
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * 服务配置
 */
interface RouteServiceConfig {
  /** 缓存过期时间（毫秒） */
  cacheExpiry: number;
  /** 最大缓存条目数 */
  maxCacheSize: number;
  /** 请求超时时间（毫秒） */
  timeout: number;
  /** 大圆航线默认分段数 */
  defaultGreatCircleSegments: number;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: RouteServiceConfig = {
  cacheExpiry: 1000 * 60 * 60, // 1 小时
  maxCacheSize: 200,
  timeout: 15000,
  defaultGreatCircleSegments: 100,
};

/**
 * 路线规划服务类
 * 
 * @description
 * 单例模式服务，提供路线规划功能
 * 支持 OSRM（OpenStreetMap 路线服务）和自定义大圆航线
 * 
 * @example
 * ```typescript
 * const service = RouteService.getInstance();
 * 
 * // 规划驾车路线
 * const route = await service.getRoute({
 *   origin: { longitude: 116.4074, latitude: 39.9042 },
 *   destination: { longitude: 121.4737, latitude: 31.2304 },
 *   travelMode: 'driving'
 * });
 * 
 * // 生成大圆航线
 * const flightPath = service.generateGreatCirclePath(
 *   { longitude: 116.4074, latitude: 39.9042 },
 *   { longitude: -122.4194, latitude: 37.7749 },
 *   100
 * );
 * ```
 */
export class RouteService {
  /** 单例实例 */
  private static instance: RouteService | null = null;
  
  /** 服务配置 */
  private config: RouteServiceConfig;
  
  /** 路线缓存 */
  private cache: Map<string, CacheEntry<RouteResponse>> = new Map();
  
  /** 请求去重 */
  private pendingRequests: Map<string, Promise<RouteResponse>> = new Map();

  /**
   * OSRM API 基础 URL
   * 使用公共 OSRM 演示服务器
   */
  private readonly osrmBaseUrl = 'https://router.project-osrm.org';

  /**
   * 私有构造函数
   */
  private constructor(config: Partial<RouteServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 获取服务单例实例
   */
  public static getInstance(config?: Partial<RouteServiceConfig>): RouteService {
    if (!RouteService.instance) {
      RouteService.instance = new RouteService(config);
    }
    return RouteService.instance;
  }

  /**
   * 获取路线
   * 
   * @param options - 路线规划选项
   * @returns 路线响应
   */
  public async getRoute(options: RouteOptions): Promise<RouteResponse> {
    const { travelMode } = options;

    // 航线模式使用大圆航线计算
    if (travelMode === 'flight' || travelMode === 'greatCircle') {
      return this.generateFlightRoute(options);
    }

    // 自定义路线直接返回直线
    if (travelMode === 'custom') {
      return this.generateCustomRoute(options);
    }

    // 生成缓存键
    const cacheKey = this.generateCacheKey(options);
    
    // 检查缓存
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // 检查是否有相同请求进行中
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      return pending;
    }

    // 创建新请求
    const request = this.fetchRoute(options);
    this.pendingRequests.set(cacheKey, request);

    try {
      const result = await request;
      this.setCache(cacheKey, result);
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * 从 OSRM 获取路线
   */
  private async fetchRoute(options: RouteOptions): Promise<RouteResponse> {
    const { origin, destination, waypoints = [], travelMode, alternatives = false } = options;

    // 构建坐标字符串
    const coordinates = [
      `${origin.longitude},${origin.latitude}`,
      ...waypoints.map(wp => `${wp.longitude},${wp.latitude}`),
      `${destination.longitude},${destination.latitude}`,
    ].join(';');

    // 确定 OSRM profile
    const profile = this.getOSRMProfile(travelMode);

    // 构建 URL
    const params = new URLSearchParams({
      overview: 'full',
      geometries: 'geojson',
      steps: 'true',
      alternatives: String(alternatives),
    });

    const url = `${this.osrmBaseUrl}/route/v1/${profile}/${coordinates}?${params}`;

    try {
      const response = await this.fetchWithTimeout(url);
      
      if (!response.ok) {
        throw new Error(`路线请求失败: ${response.status}`);
      }

      const data: OSRMResponse = await response.json();
      
      if (data.code !== 'Ok' || !data.routes[0]) {
        throw new Error('无法找到路线');
      }

      return this.parseOSRMResponse(data, travelMode, alternatives);
    } catch (error) {
      console.error('[RouteService] 获取路线失败:', error);
      throw error;
    }
  }

  /**
   * 解析 OSRM 响应
   */
  private parseOSRMResponse(
    data: OSRMResponse,
    travelMode: PathType,
    includeAlternatives: boolean
  ): RouteResponse {
    const primaryRoute = data.routes[0]!;
    
    // 解析主路线
    const result = this.parseOSRMRoute(primaryRoute, travelMode, data.waypoints);

    // 解析备选路线
    if (includeAlternatives && data.routes.length > 1) {
      result.alternatives = data.routes.slice(1).map(route => 
        this.parseOSRMRoute(route, travelMode, data.waypoints)
      );
    }

    return result;
  }

  /**
   * 解析单条 OSRM 路线
   */
  private parseOSRMRoute(
    route: OSRMRoute,
    travelMode: PathType,
    waypoints: OSRMResponse['waypoints']
  ): RouteResponse {
    // 提取几何坐标
    const geometry: GeoCoordinate[] = route.geometry.coordinates.map(coord => ({
      longitude: coord[0]!,
      latitude: coord[1]!,
    }));

    // 计算边界框
    const bounds = this.calculateBounds(geometry);

    // 解析步骤
    const steps: RouteStep[] = [];
    let cumulativeDistance = 0;
    let cumulativeDuration = 0;

    for (const leg of route.legs) {
      for (const step of leg.steps) {
        const stepGeometry: GeoCoordinate[] = step.geometry.coordinates.map(coord => ({
          longitude: coord[0]!,
          latitude: coord[1]!,
        }));

        const stepItem: RouteStep = {
          geometry: stepGeometry,
          distance: step.distance,
          duration: step.duration,
          maneuver: this.parseManeuver(step.maneuver.type, step.maneuver.modifier),
        };
        if (step.maneuver.instruction) stepItem.instruction = step.maneuver.instruction;
        if (step.name) stepItem.roadName = step.name;
        steps.push(stepItem);

        cumulativeDistance += step.distance;
        cumulativeDuration += step.duration;
      }
    }

    // 解析途经点
    const parsedWaypoints: RouteWaypoint[] = waypoints.map((wp, index) => {
      const waypoint: RouteWaypoint = {
        coordinate: {
          longitude: wp.location[0],
          latitude: wp.location[1],
        },
        distanceFromStart: index === 0 ? 0 : cumulativeDistance * (index / (waypoints.length - 1)),
        durationFromStart: index === 0 ? 0 : cumulativeDuration * (index / (waypoints.length - 1)),
      };
      if (wp.name) waypoint.name = wp.name;
      return waypoint;
    });

    // 生成摘要
    const summaryParts = route.legs.map(leg => leg.summary).filter(Boolean);
    const summary = summaryParts.join(' → ') || '路线';

    return {
      geometry,
      distance: route.distance,
      duration: route.duration,
      bounds,
      waypoints: parsedWaypoints,
      steps,
      summary,
      travelMode,
    };
  }

  /**
   * 解析转向动作
   */
  private parseManeuver(type: string, modifier?: string): RouteManeuver {
    if (type === 'arrive') return 'arrive';
    if (type === 'depart') return 'depart';
    if (type === 'merge') return 'merge';
    if (type === 'roundabout' || type === 'rotary') return 'roundabout';
    if (type === 'exit') return 'exit';
    
    switch (modifier) {
      case 'straight':
        return 'straight';
      case 'slight left':
        return 'slight-left';
      case 'slight right':
        return 'slight-right';
      case 'left':
        return 'left';
      case 'right':
        return 'right';
      case 'sharp left':
        return 'sharp-left';
      case 'sharp right':
        return 'sharp-right';
      case 'uturn':
        return 'u-turn';
      default:
        return 'straight';
    }
  }

  /**
   * 获取 OSRM profile
   */
  private getOSRMProfile(travelMode: PathType): string {
    switch (travelMode) {
      case 'driving':
        return 'driving';
      case 'walking':
        return 'foot';
      case 'cycling':
        return 'bike';
      default:
        return 'driving';
    }
  }

  /**
   * 生成航线路线（大圆航线）
   */
  private generateFlightRoute(options: RouteOptions): RouteResponse {
    const {
      origin,
      destination,
      waypoints = [],
      travelMode,
      greatCircleSegments = this.config.defaultGreatCircleSegments,
    } = options;

    // 构建所有点
    const allPoints = [origin, ...waypoints, destination];
    
    // 生成分段大圆航线
    const geometry: GeoCoordinate[] = [];
    let totalDistance = 0;

    for (let i = 0; i < allPoints.length - 1; i++) {
      const start = allPoints[i]!;
      const end = allPoints[i + 1]!;
      
      const segmentPath = this.generateGreatCirclePath(
        start,
        end,
        Math.ceil(greatCircleSegments / (allPoints.length - 1))
      );
      
      // 避免重复添加连接点
      if (i > 0) {
        segmentPath.shift();
      }
      
      geometry.push(...segmentPath);
      
      // 计算距离
      totalDistance += this.calculateDistance(start, end);
    }

    // 估算飞行时间（假设平均速度 800 km/h）
    const averageSpeedKmh = 800;
    const duration = (totalDistance / 1000 / averageSpeedKmh) * 3600;

    // 边界框
    const bounds = this.calculateBounds(geometry);

    // 途经点
    const parsedWaypoints: RouteWaypoint[] = allPoints.map((point, index) => {
      let distanceFromStart = 0;
      for (let i = 0; i < index; i++) {
        distanceFromStart += this.calculateDistance(allPoints[i]!, allPoints[i + 1]!);
      }
      return {
        coordinate: point,
        distanceFromStart,
        durationFromStart: (distanceFromStart / totalDistance) * duration,
      };
    });

    return {
      geometry,
      distance: totalDistance,
      duration,
      bounds,
      waypoints: parsedWaypoints,
      steps: [{
        geometry,
        distance: totalDistance,
        duration,
        instruction: `飞行 ${Math.round(totalDistance / 1000)} 公里`,
      }],
      summary: `航线 ${Math.round(totalDistance / 1000)} 公里`,
      travelMode,
    };
  }

  /**
   * 生成自定义路线（直线）
   */
  private generateCustomRoute(options: RouteOptions): RouteResponse {
    const { origin, destination, waypoints = [], travelMode } = options;

    const allPoints = [origin, ...waypoints, destination];
    const geometry = [...allPoints];
    
    let totalDistance = 0;
    for (let i = 0; i < allPoints.length - 1; i++) {
      totalDistance += this.calculateDistance(allPoints[i]!, allPoints[i + 1]!);
    }

    const bounds = this.calculateBounds(geometry);
    
    const parsedWaypoints: RouteWaypoint[] = allPoints.map((point, index) => {
      let distanceFromStart = 0;
      for (let i = 0; i < index; i++) {
        distanceFromStart += this.calculateDistance(allPoints[i]!, allPoints[i + 1]!);
      }
      return {
        coordinate: point,
        distanceFromStart,
        durationFromStart: 0,
      };
    });

    return {
      geometry,
      distance: totalDistance,
      duration: 0,
      bounds,
      waypoints: parsedWaypoints,
      steps: [{
        geometry,
        distance: totalDistance,
        duration: 0,
      }],
      summary: `自定义路线 ${Math.round(totalDistance / 1000)} 公里`,
      travelMode,
    };
  }

  /**
   * 生成大圆航线路径
   * 
   * @param start - 起点
   * @param end - 终点
   * @param segments - 分段数
   * @returns 大圆航线坐标数组
   */
  public generateGreatCirclePath(
    start: GeoCoordinate,
    end: GeoCoordinate,
    segments = 100
  ): GeoCoordinate[] {
    // 使用 turf.js 生成大圆航线
    const line = turf.greatCircle(
      [start.longitude, start.latitude],
      [end.longitude, end.latitude],
      { npoints: segments }
    );

    // 提取坐标
    const coordinates = line.geometry.coordinates;
    
    // 处理跨日期变更线的情况
    return this.handleDateLineCrossing(coordinates as number[][]);
  }

  /**
   * 处理跨日期变更线的情况
   */
  private handleDateLineCrossing(coordinates: number[][]): GeoCoordinate[] {
    const result: GeoCoordinate[] = [];
    
    for (let i = 0; i < coordinates.length; i++) {
      const coord = coordinates[i]!;
      let longitude = coord[0]!;
      
      // 检测日期变更线穿越
      if (i > 0) {
        const prevLng = result[result.length - 1]!.longitude;
        const diff = longitude - prevLng;
        
        // 如果经度变化超过 180 度，调整
        if (diff > 180) {
          longitude -= 360;
        } else if (diff < -180) {
          longitude += 360;
        }
      }
      
      result.push({
        longitude,
        latitude: coord[1]!,
      });
    }
    
    return result;
  }

  /**
   * 计算两点间距离（米）
   */
  public calculateDistance(point1: GeoCoordinate, point2: GeoCoordinate): number {
    const from = turf.point([point1.longitude, point1.latitude]);
    const to = turf.point([point2.longitude, point2.latitude]);
    return turf.distance(from, to, { units: 'meters' });
  }

  /**
   * 计算路径总长度（米）
   */
  public calculatePathLength(path: GeoCoordinate[]): number {
    let totalLength = 0;
    for (let i = 0; i < path.length - 1; i++) {
      totalLength += this.calculateDistance(path[i]!, path[i + 1]!);
    }
    return totalLength;
  }

  /**
   * 在路径上获取指定距离处的点
   * 
   * @param path - 路径坐标数组
   * @param distance - 从起点的距离（米）
   * @returns 插值后的坐标点
   */
  public getPointAtDistance(path: GeoCoordinate[], distance: number): GeoCoordinate {
    if (path.length === 0) {
      throw new Error('路径不能为空');
    }
    if (path.length === 1) {
      return path[0]!;
    }

    const line = turf.lineString(path.map(p => [p.longitude, p.latitude]));
    const along = turf.along(line, distance, { units: 'meters' });
    
    return {
      longitude: along.geometry.coordinates[0]!,
      latitude: along.geometry.coordinates[1]!,
    };
  }

  /**
   * 获取路径上指定进度的点
   * 
   * @param path - 路径坐标数组
   * @param progress - 进度（0-1）
   * @returns 插值后的坐标点
   */
  public getPointAtProgress(path: GeoCoordinate[], progress: number): GeoCoordinate {
    const totalLength = this.calculatePathLength(path);
    const distance = totalLength * Math.max(0, Math.min(1, progress));
    return this.getPointAtDistance(path, distance);
  }

  /**
   * 获取路径上指定位置的方向角
   * 
   * @param path - 路径坐标数组
   * @param progress - 进度（0-1）
   * @returns 方向角（度，0-360）
   */
  public getBearingAtProgress(path: GeoCoordinate[], progress: number): number {
    if (path.length < 2) {
      return 0;
    }

    const totalLength = this.calculatePathLength(path);
    const distance = totalLength * Math.max(0, Math.min(1, progress));
    
    // 找到当前点前后的两个点
    let accumulatedDistance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const segmentLength = this.calculateDistance(path[i]!, path[i + 1]!);
      
      if (accumulatedDistance + segmentLength >= distance) {
        const point1 = turf.point([path[i]!.longitude, path[i]!.latitude]);
        const point2 = turf.point([path[i + 1]!.longitude, path[i + 1]!.latitude]);
        return turf.bearing(point1, point2);
      }
      
      accumulatedDistance += segmentLength;
    }

    // 返回最后一段的方向
    const lastIndex = path.length - 1;
    const point1 = turf.point([path[lastIndex - 1]!.longitude, path[lastIndex - 1]!.latitude]);
    const point2 = turf.point([path[lastIndex]!.longitude, path[lastIndex]!.latitude]);
    return turf.bearing(point1, point2);
  }

  /**
   * 平滑路径
   * 
   * @param path - 原始路径
   * @param resolution - 输出点数量
   * @returns 平滑后的路径
   */
  public smoothPath(path: GeoCoordinate[], resolution = 100): GeoCoordinate[] {
    if (path.length < 3) {
      return path;
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
   * @param path - 原始路径
   * @param tolerance - 简化容差（度）
   * @returns 简化后的路径
   */
  public simplifyPath(path: GeoCoordinate[], tolerance = 0.001): GeoCoordinate[] {
    if (path.length < 3) {
      return path;
    }

    const line = turf.lineString(path.map(p => [p.longitude, p.latitude]));
    const simplified = turf.simplify(line, { tolerance, highQuality: true });
    
    return simplified.geometry.coordinates.map(coord => ({
      longitude: coord[0]!,
      latitude: coord[1]!,
    }));
  }

  /**
   * 计算边界框
   */
  private calculateBounds(geometry: GeoCoordinate[]): BoundingBox {
    if (geometry.length === 0) {
      return { west: 0, south: 0, east: 0, north: 0 };
    }

    let west = Infinity;
    let south = Infinity;
    let east = -Infinity;
    let north = -Infinity;

    for (const point of geometry) {
      west = Math.min(west, point.longitude);
      south = Math.min(south, point.latitude);
      east = Math.max(east, point.longitude);
      north = Math.max(north, point.latitude);
    }

    return { west, south, east, north };
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(options: RouteOptions): string {
    const { origin, destination, waypoints = [], travelMode, alternatives } = options;
    const waypointsStr = waypoints.map(w => `${w.longitude},${w.latitude}`).join('|');
    return `${travelMode}:${origin.longitude},${origin.latitude}:${destination.longitude},${destination.latitude}:${waypointsStr}:${alternatives}`;
  }

  /**
   * 从缓存获取
   */
  private getFromCache(key: string): RouteResponse | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  /**
   * 设置缓存
   */
  private setCache(key: string, data: RouteResponse): void {
    if (this.cache.size >= this.config.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.config.cacheExpiry,
    });
  }

  /**
   * 带超时的 fetch
   */
  private async fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    
    try {
      return await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 清除缓存
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * 销毁服务
   */
  public destroy(): void {
    this.clearCache();
    this.pendingRequests.clear();
    RouteService.instance = null;
  }
}

/**
 * 导出服务单例
 */
export const routeService = RouteService.getInstance();

export default RouteService;
