/**
 * 地理编码服务
 * 
 * @description
 * 提供地理编码和反向地理编码功能，包括：
 * - 地点搜索（根据关键词搜索地点）
 * - 反向地理编码（根据坐标获取地址）
 * - 搜索建议和自动补全
 * - 搜索结果缓存
 * 
 * @module services/GeocodingService
 */

import type { GeoCoordinate, BoundingBox } from '@/types/common';

/**
 * 地理编码结果接口
 */
export interface GeocodingResult {
  /** 结果唯一标识 */
  id: string;
  /** 地点名称 */
  name: string;
  /** 显示名称（完整地址） */
  displayName: string;
  /** 地点类型 */
  type: GeocodingResultType;
  /** 中心坐标 */
  coordinate: GeoCoordinate;
  /** 边界框 */
  bounds?: BoundingBox;
  /** 国家代码 */
  countryCode?: string;
  /** 国家名称 */
  country?: string;
  /** 省/州 */
  state?: string;
  /** 城市 */
  city?: string;
  /** 区/县 */
  district?: string;
  /** 街道地址 */
  street?: string;
  /** 门牌号 */
  houseNumber?: string;
  /** 邮政编码 */
  postalCode?: string;
  /** 重要性评分 (0-1) */
  importance: number;
  /** 原始数据 */
  raw?: Record<string, unknown>;
}

/**
 * 地理编码结果类型枚举
 */
export type GeocodingResultType =
  | 'country'    // 国家
  | 'state'      // 省/州
  | 'city'       // 城市
  | 'district'   // 区/县
  | 'suburb'     // 郊区
  | 'street'     // 街道
  | 'address'    // 地址
  | 'poi'        // 兴趣点
  | 'natural'    // 自然地物
  | 'boundary'   // 边界
  | 'other';     // 其他

/**
 * 地理编码选项
 */
export interface GeocodingOptions {
  /** 搜索语言 */
  language?: string;
  /** 限制搜索的国家代码 */
  countryCode?: string;
  /** 搜索范围中心点 */
  proximity?: GeoCoordinate;
  /** 搜索边界 */
  bounds?: BoundingBox;
  /** 最大结果数量 */
  limit?: number;
  /** 结果类型过滤 */
  types?: GeocodingResultType[];
  /** 是否包含边界框 */
  includeBounds?: boolean;
}

/**
 * 反向地理编码选项
 */
export interface ReverseGeocodingOptions {
  /** 搜索语言 */
  language?: string;
  /** 缩放级别（影响返回详细程度） */
  zoom?: number;
  /** 是否包含地址层次 */
  addressDetails?: boolean;
}

/**
 * 搜索建议接口
 */
export interface SearchSuggestion {
  /** 建议文本 */
  text: string;
  /** 匹配的地点 ID */
  placeId?: string;
  /** 地点类型 */
  type: GeocodingResultType;
  /** 高亮显示的文本区间 */
  highlights?: Array<{ start: number; end: number }>;
}

/**
 * 缓存条目接口
 */
interface CacheEntry<T> {
  /** 缓存数据 */
  data: T;
  /** 过期时间戳 */
  expiresAt: number;
}

/**
 * 地理编码服务配置
 */
interface GeocodingServiceConfig {
  /** 缓存过期时间（毫秒） */
  cacheExpiry: number;
  /** 最大缓存条目数 */
  maxCacheSize: number;
  /** 默认语言 */
  defaultLanguage: string;
  /** 默认结果数量限制 */
  defaultLimit: number;
  /** 请求超时时间（毫秒） */
  timeout: number;
}

/**
 * 默认服务配置
 */
const DEFAULT_CONFIG: GeocodingServiceConfig = {
  cacheExpiry: 1000 * 60 * 30, // 30 分钟
  maxCacheSize: 500,
  defaultLanguage: 'zh-CN',
  defaultLimit: 10,
  timeout: 10000,
};

/**
 * Nominatim API 响应接口
 */
interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  boundingbox?: [string, string, string, string];
  address?: {
    country?: string;
    country_code?: string;
    state?: string;
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    district?: string;
    road?: string;
    house_number?: string;
    postcode?: string;
  };
}

/**
 * 地理编码服务类
 * 
 * @description
 * 单例模式服务，提供地理编码功能
 * 使用 OpenStreetMap Nominatim API 作为默认数据源
 * 
 * @example
 * ```typescript
 * const service = GeocodingService.getInstance();
 * 
 * // 搜索地点
 * const results = await service.search('北京天安门');
 * 
 * // 反向地理编码
 * const address = await service.reverse({
 *   longitude: 116.4074,
 *   latitude: 39.9042
 * });
 * ```
 */
export class GeocodingService {
  /** 单例实例 */
  private static instance: GeocodingService | null = null;
  
  /** 服务配置 */
  private config: GeocodingServiceConfig;
  
  /** 结果缓存 */
  private cache: Map<string, CacheEntry<GeocodingResult[]>> = new Map();
  
  /** 请求去重映射 */
  private pendingRequests: Map<string, Promise<GeocodingResult[]>> = new Map();

  /**
   * API 基础 URL
   * 使用 Nominatim（OpenStreetMap）作为默认地理编码服务
   */
  private readonly baseUrl = 'https://nominatim.openstreetmap.org';

  /**
   * 私有构造函数
   * 
   * @param config - 服务配置
   */
  private constructor(config: Partial<GeocodingServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 获取服务单例实例
   * 
   * @param config - 可选的配置覆盖
   * @returns GeocodingService 单例实例
   */
  public static getInstance(config?: Partial<GeocodingServiceConfig>): GeocodingService {
    if (!GeocodingService.instance) {
      GeocodingService.instance = new GeocodingService(config);
    }
    return GeocodingService.instance;
  }

  /**
   * 地点搜索
   * 
   * @param query - 搜索关键词
   * @param options - 搜索选项
   * @returns 搜索结果数组
   */
  public async search(
    query: string,
    options: GeocodingOptions = {}
  ): Promise<GeocodingResult[]> {
    // 验证查询参数
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return [];
    }

    // 生成缓存键
    const cacheKey = this.generateCacheKey('search', trimmedQuery, options as unknown as Record<string, unknown>);
    
    // 检查缓存
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // 检查是否有相同的请求正在进行
    const pendingRequest = this.pendingRequests.get(cacheKey);
    if (pendingRequest) {
      return pendingRequest;
    }

    // 创建新请求
    const requestPromise = this.executeSearch(trimmedQuery, options);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const results = await requestPromise;
      
      // 缓存结果
      this.setCache(cacheKey, results);
      
      return results;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * 执行搜索请求
   * 
   * @param query - 搜索关键词
   * @param options - 搜索选项
   * @returns 搜索结果数组
   */
  private async executeSearch(
    query: string,
    options: GeocodingOptions
  ): Promise<GeocodingResult[]> {
    const {
      language = this.config.defaultLanguage,
      countryCode,
      proximity,
      bounds,
      limit = this.config.defaultLimit,
      includeBounds = true,
    } = options;

    // 构建查询参数
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: String(limit),
      'accept-language': language,
    });

    // 添加国家限制
    if (countryCode) {
      params.append('countrycodes', countryCode.toLowerCase());
    }

    // 添加边界限制
    if (bounds) {
      params.append('viewbox', `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`);
      params.append('bounded', '1');
    } else if (proximity) {
      // 如果没有边界但有邻近点，创建一个大的搜索范围
      const offset = 1; // 约 100km
      params.append('viewbox', `${proximity.longitude - offset},${proximity.latitude - offset},${proximity.longitude + offset},${proximity.latitude + offset}`);
    }

    // 是否需要边界框
    if (includeBounds) {
      params.append('polygon_geojson', '0');
    }

    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/search?${params.toString()}`,
        {
          headers: {
            'User-Agent': 'MapMotion/1.0 (https://mapmotion.app)',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`地理编码请求失败: ${response.status}`);
      }

      const data: NominatimResult[] = await response.json();
      
      return data.map(item => this.parseNominatimResult(item));
    } catch (error) {
      console.error('[GeocodingService] 搜索失败:', error);
      throw error;
    }
  }

  /**
   * 反向地理编码
   * 
   * @param coordinate - 地理坐标
   * @param options - 反向编码选项
   * @returns 地理编码结果，未找到返回 null
   */
  public async reverse(
    coordinate: GeoCoordinate,
    options: ReverseGeocodingOptions = {}
  ): Promise<GeocodingResult | null> {
    const {
      language = this.config.defaultLanguage,
      zoom = 18,
      addressDetails = true,
    } = options;

    // 生成缓存键
    const cacheKey = this.generateCacheKey(
      'reverse',
      `${coordinate.longitude.toFixed(6)},${coordinate.latitude.toFixed(6)}`,
      { zoom }
    );

    // 检查缓存
    const cached = this.getFromCache(cacheKey);
    if (cached && cached[0]) {
      return cached[0];
    }

    // 构建查询参数
    const params = new URLSearchParams({
      lat: String(coordinate.latitude),
      lon: String(coordinate.longitude),
      format: 'json',
      addressdetails: addressDetails ? '1' : '0',
      zoom: String(zoom),
      'accept-language': language,
    });

    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/reverse?${params.toString()}`,
        {
          headers: {
            'User-Agent': 'MapMotion/1.0 (https://mapmotion.app)',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`反向地理编码请求失败: ${response.status}`);
      }

      const data: NominatimResult = await response.json();
      const result = this.parseNominatimResult(data);
      
      // 缓存结果
      this.setCache(cacheKey, [result]);
      
      return result;
    } catch (error) {
      console.error('[GeocodingService] 反向编码失败:', error);
      throw error;
    }
  }

  /**
   * 获取搜索建议
   * 
   * @param query - 搜索关键词
   * @param options - 搜索选项
   * @returns 搜索建议数组
   */
  public async getSuggestions(
    query: string,
    options: GeocodingOptions = {}
  ): Promise<SearchSuggestion[]> {
    // 搜索建议使用较少的结果数
    const results = await this.search(query, {
      ...options,
      limit: Math.min(options.limit ?? 5, 5),
    });

    return results.map(result => ({
      text: result.displayName,
      placeId: result.id,
      type: result.type,
      highlights: this.findHighlights(result.displayName, query),
    }));
  }

  /**
   * 批量地理编码
   * 
   * @param queries - 搜索关键词数组
   * @param options - 搜索选项
   * @returns 结果数组（每个查询对应一个结果数组）
   */
  public async batchSearch(
    queries: string[],
    options: GeocodingOptions = {}
  ): Promise<GeocodingResult[][]> {
    // 并行执行搜索，但添加延迟以避免速率限制
    const results: GeocodingResult[][] = [];
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      if (query) {
        // 添加延迟以遵守 API 速率限制
        if (i > 0) {
          await this.delay(1000);
        }
        
        try {
          const searchResults = await this.search(query, options);
          results.push(searchResults);
        } catch (error) {
          console.error(`[GeocodingService] 批量搜索失败 (${query}):`, error);
          results.push([]);
        }
      } else {
        results.push([]);
      }
    }
    
    return results;
  }

  /**
   * 解析 Nominatim API 响应
   * 
   * @param item - Nominatim 响应项
   * @returns 标准化的地理编码结果
   */
  private parseNominatimResult(item: NominatimResult): GeocodingResult {
    const address = item.address;
    
    // 确定结果类型
    const type = this.determineResultType(item.class, item.type, item.addresstype);
    
    // 解析边界框
    let bounds: BoundingBox | undefined;
    if (item.boundingbox) {
      bounds = {
        south: parseFloat(item.boundingbox[0]),
        north: parseFloat(item.boundingbox[1]),
        west: parseFloat(item.boundingbox[2]),
        east: parseFloat(item.boundingbox[3]),
      };
    }

    // 构建基础结果对象
    const result: GeocodingResult = {
      id: String(item.place_id),
      name: item.name || item.display_name.split(',')[0] || '',
      displayName: item.display_name,
      type,
      coordinate: {
        longitude: parseFloat(item.lon),
        latitude: parseFloat(item.lat),
      },
      importance: item.importance,
    };

    // 条件添加可选属性，避免 exactOptionalPropertyTypes 问题
    if (bounds) result.bounds = bounds;
    if (address?.country_code) result.countryCode = address.country_code.toUpperCase();
    if (address?.country) result.country = address.country;
    if (address?.state) result.state = address.state;
    const city = address?.city || address?.town || address?.village;
    if (city) result.city = city;
    const district = address?.district || address?.suburb;
    if (district) result.district = district;
    if (address?.road) result.street = address.road;
    if (address?.house_number) result.houseNumber = address.house_number;
    if (address?.postcode) result.postalCode = address.postcode;
    result.raw = item as unknown as Record<string, unknown>;

    return result;
  }

  /**
   * 确定结果类型
   * 
   * @param osmClass - OSM 分类
   * @param osmType - OSM 类型
   * @param addressType - 地址类型
   * @returns 标准化的结果类型
   */
  private determineResultType(
    osmClass: string,
    osmType: string,
    addressType: string
  ): GeocodingResultType {
    // 根据地址类型判断
    switch (addressType) {
      case 'country':
        return 'country';
      case 'state':
      case 'province':
      case 'region':
        return 'state';
      case 'city':
      case 'town':
      case 'village':
      case 'municipality':
        return 'city';
      case 'district':
      case 'suburb':
      case 'neighbourhood':
        return 'district';
      case 'road':
      case 'street':
        return 'street';
      case 'house':
      case 'building':
        return 'address';
    }

    // 根据 OSM 分类判断
    switch (osmClass) {
      case 'boundary':
        return 'boundary';
      case 'place':
        if (['country', 'state', 'region'].includes(osmType)) return 'country';
        if (['city', 'town', 'village'].includes(osmType)) return 'city';
        if (['suburb', 'neighbourhood'].includes(osmType)) return 'district';
        return 'other';
      case 'highway':
        return 'street';
      case 'building':
        return 'address';
      case 'amenity':
      case 'shop':
      case 'tourism':
      case 'leisure':
        return 'poi';
      case 'natural':
      case 'waterway':
      case 'landuse':
        return 'natural';
      default:
        return 'other';
    }
  }

  /**
   * 查找高亮文本区间
   * 
   * @param text - 原始文本
   * @param query - 搜索关键词
   * @returns 高亮区间数组
   */
  private findHighlights(
    text: string,
    query: string
  ): Array<{ start: number; end: number }> {
    const highlights: Array<{ start: number; end: number }> = [];
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    let startIndex = 0;
    while (true) {
      const index = lowerText.indexOf(lowerQuery, startIndex);
      if (index === -1) break;
      
      highlights.push({
        start: index,
        end: index + query.length,
      });
      
      startIndex = index + 1;
    }
    
    return highlights;
  }

  /**
   * 生成缓存键
   * 
   * @param type - 请求类型
   * @param query - 查询内容
   * @param options - 选项
   * @returns 缓存键字符串
   */
  private generateCacheKey(
    type: string,
    query: string,
    options: Record<string, unknown>
  ): string {
    const optionsStr = JSON.stringify(options);
    return `${type}:${query.toLowerCase()}:${optionsStr}`;
  }

  /**
   * 从缓存获取数据
   * 
   * @param key - 缓存键
   * @returns 缓存数据，过期或不存在返回 null
   */
  private getFromCache(key: string): GeocodingResult[] | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // 检查是否过期
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * 设置缓存数据
   * 
   * @param key - 缓存键
   * @param data - 缓存数据
   */
  private setCache(key: string, data: GeocodingResult[]): void {
    // 检查缓存大小
    if (this.cache.size >= this.config.maxCacheSize) {
      // 删除最旧的条目
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
   * 带超时的 fetch 请求
   * 
   * @param url - 请求 URL
   * @param options - fetch 选项
   * @returns Response 对象
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 延迟函数
   * 
   * @param ms - 延迟毫秒数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 清除缓存
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计信息
   * 
   * @returns 缓存统计
   */
  public getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxCacheSize,
    };
  }

  /**
   * 销毁服务实例
   */
  public destroy(): void {
    this.clearCache();
    this.pendingRequests.clear();
    GeocodingService.instance = null;
  }
}

/**
 * 导出服务单例
 */
export const geocodingService = GeocodingService.getInstance();

export default GeocodingService;
