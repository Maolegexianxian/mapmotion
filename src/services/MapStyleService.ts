/**
 * 地图样式服务
 * 
 * @description
 * 提供地图样式管理功能，包括：
 * - 预设样式库管理
 * - 自定义主题生成
 * - 样式切换与应用
 * - 从品牌色/图片生成主题
 * 
 * @module services/MapStyleService
 */

import chroma from 'chroma-js';
import type {
  PresetStyleId,
  ThemeConfig,
  ColorPalette,
  MapStyle,
  StyleLayer,
} from '@/types/style';

/**
 * 地图样式预设配置
 * 包含样式的完整元信息
 */
export interface MapStylePreset {
  /** 预设唯一标识 */
  id: PresetStyleId;
  /** 预设名称 */
  name: string;
  /** 预设描述 */
  description: string;
  /** 缩略图 URL */
  thumbnailUrl: string;
  /** 样式 JSON URL */
  styleUrl: string;
  /** 是否为高级样式（需要付费） */
  isPremium: boolean;
  /** 数据源归属信息 */
  attribution: string;
  /** 支持的功能特性 */
  features: StyleFeature[];
}

/**
 * 样式支持的特性枚举
 */
export type StyleFeature = 
  | '3d-buildings'
  | 'terrain'
  | 'satellite'
  | 'traffic'
  | 'transit'
  | 'dark-mode';

/**
 * 样式主题颜色配置
 * 用于自定义样式生成
 */
export interface StyleThemeColors {
  /** 主色调 */
  primary: string;
  /** 背景色 */
  background: string;
  /** 水域颜色 */
  water: string;
  /** 陆地颜色 */
  land: string;
  /** 道路颜色 */
  road: string;
  /** 建筑颜色 */
  building: string;
  /** 文字颜色 */
  text: string;
  /** 文字光晕颜色 */
  textHalo: string;
  /** 边界颜色 */
  boundary: string;
  /** 公园/绿地颜色 */
  park: string;
}

/**
 * 样式生成选项
 */
export interface StyleGenerationOptions {
  /** 基础样式模式 */
  mode: 'light' | 'dark' | 'auto';
  /** 对比度调整（0.5-1.5） */
  contrast: number;
  /** 饱和度调整（0-2） */
  saturation: number;
  /** 是否保留原始标签 */
  preserveLabels: boolean;
}

/**
 * 内置预设样式列表
 * 提供多种免费和高级样式选择
 */
const PRESET_STYLES: MapStylePreset[] = [
  {
    id: 'light',
    name: '浅色',
    description: '明亮简洁的浅色地图样式，适合日间使用',
    thumbnailUrl: '/assets/styles/light-thumb.png',
    styleUrl: 'https://demotiles.maplibre.org/style.json',
    isPremium: false,
    attribution: '© MapLibre © OpenStreetMap contributors',
    features: [],
  },
  {
    id: 'dark',
    name: '深色',
    description: '深色地图样式，适合夜间使用或深色主题',
    thumbnailUrl: '/assets/styles/dark-thumb.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    isPremium: false,
    attribution: '© CARTO © OpenStreetMap contributors',
    features: ['dark-mode'],
  },
  {
    id: 'streets',
    name: '街道',
    description: '详细的街道地图，显示道路、建筑和POI',
    thumbnailUrl: '/assets/styles/streets-thumb.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    isPremium: false,
    attribution: '© CARTO © OpenStreetMap contributors',
    features: [],
  },
  {
    id: 'satellite',
    name: '卫星',
    description: '卫星影像图层，展示真实地表',
    thumbnailUrl: '/assets/styles/satellite-thumb.png',
    styleUrl: 'https://api.maptiler.com/maps/satellite/style.json',
    isPremium: true,
    attribution: '© MapTiler © OpenStreetMap contributors',
    features: ['satellite'],
  },
  {
    id: 'outdoors',
    name: '户外',
    description: '户外地图，突出地形、徒步路线',
    thumbnailUrl: '/assets/styles/outdoors-thumb.png',
    styleUrl: 'https://api.maptiler.com/maps/outdoor/style.json',
    isPremium: true,
    attribution: '© MapTiler © OpenStreetMap contributors',
    features: ['terrain'],
  },
  {
    id: 'navigation',
    name: '导航',
    description: '导航优化样式，突出道路和交通信息',
    thumbnailUrl: '/assets/styles/navigation-thumb.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    isPremium: false,
    attribution: '© CARTO © OpenStreetMap contributors',
    features: ['traffic'],
  },
  {
    id: 'monochrome',
    name: '单色',
    description: '简约单色风格，适合数据可视化叠加',
    thumbnailUrl: '/assets/styles/monochrome-thumb.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json',
    isPremium: false,
    attribution: '© CARTO © OpenStreetMap contributors',
    features: [],
  },
  {
    id: 'blueprint',
    name: '蓝图',
    description: '技术蓝图风格，适合工业/建筑场景',
    thumbnailUrl: '/assets/styles/blueprint-thumb.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
    isPremium: false,
    attribution: '© CARTO © OpenStreetMap contributors',
    features: ['dark-mode'],
  },
  {
    id: 'vintage',
    name: '复古',
    description: '复古纸质地图风格',
    thumbnailUrl: '/assets/styles/vintage-thumb.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/voyager-nolabels-gl-style/style.json',
    isPremium: false,
    attribution: '© CARTO © OpenStreetMap contributors',
    features: [],
  },
  {
    id: 'watercolor',
    name: '水彩',
    description: '艺术水彩画风格',
    thumbnailUrl: '/assets/styles/watercolor-thumb.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    isPremium: true,
    attribution: '© CARTO © OpenStreetMap contributors',
    features: [],
  },
];

/**
 * 地图样式服务类
 * 
 * @description
 * 单例模式服务，提供地图样式的管理和生成功能
 * 
 * @example
 * ```typescript
 * // 获取服务实例
 * const service = MapStyleService.getInstance();
 * 
 * // 获取所有预设样式
 * const presets = service.getPresetStyles();
 * 
 * // 从主色调生成主题
 * const theme = service.generateThemeFromColor('#3B82F6');
 * ```
 */
export class MapStyleService {
  /** 单例实例 */
  private static instance: MapStyleService | null = null;
  
  /** 样式缓存 */
  private styleCache: Map<string, unknown> = new Map();
  
  /** 当前激活的样式 ID */
  private activeStyleId: PresetStyleId | string = 'light';

  /**
   * 私有构造函数，防止直接实例化
   */
  private constructor() {
    // 初始化时预加载常用样式元数据
    this.initializeStyleCache();
  }

  /**
   * 获取服务单例实例
   * 
   * @returns MapStyleService 单例实例
   */
  public static getInstance(): MapStyleService {
    if (!MapStyleService.instance) {
      MapStyleService.instance = new MapStyleService();
    }
    return MapStyleService.instance;
  }

  /**
   * 初始化样式缓存
   */
  private initializeStyleCache(): void {
    // 预加载免费样式的元数据
    PRESET_STYLES.filter(s => !s.isPremium).forEach(style => {
      this.styleCache.set(`meta:${style.id}`, style);
    });
  }

  /**
   * 获取所有预设样式列表
   * 
   * @param includePrivate - 是否包含高级样式
   * @returns 预设样式数组
   */
  public getPresetStyles(includePrivate = false): MapStylePreset[] {
    if (includePrivate) {
      return [...PRESET_STYLES];
    }
    return PRESET_STYLES.filter(style => !style.isPremium);
  }

  /**
   * 根据 ID 获取预设样式
   * 
   * @param id - 预设样式 ID
   * @returns 预设样式配置，未找到返回 null
   */
  public getPresetStyle(id: PresetStyleId): MapStylePreset | null {
    return PRESET_STYLES.find(style => style.id === id) ?? null;
  }

  /**
   * 获取当前激活的样式 ID
   * 
   * @returns 当前样式 ID
   */
  public getActiveStyleId(): string {
    return this.activeStyleId;
  }

  /**
   * 设置当前激活的样式
   * 
   * @param styleId - 样式 ID
   */
  public setActiveStyleId(styleId: PresetStyleId | string): void {
    this.activeStyleId = styleId;
  }

  /**
   * 获取样式 URL
   * 
   * @param styleId - 样式 ID
   * @returns 样式 JSON URL
   */
  public getStyleUrl(styleId: PresetStyleId): string {
    const preset = this.getPresetStyle(styleId);
    return preset?.styleUrl ?? PRESET_STYLES[0]!.styleUrl;
  }

  /**
   * 加载样式 JSON
   * 
   * @param styleUrl - 样式 URL
   * @returns 样式 JSON 对象
   */
  public async loadStyleJson(styleUrl: string): Promise<unknown> {
    // 检查缓存
    const cached = this.styleCache.get(`json:${styleUrl}`);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(styleUrl);
      if (!response.ok) {
        throw new Error(`样式加载失败: ${response.status}`);
      }
      const styleJson = await response.json();
      
      // 缓存结果
      this.styleCache.set(`json:${styleUrl}`, styleJson);
      
      return styleJson;
    } catch (error) {
      console.error('[MapStyleService] 加载样式失败:', error);
      throw error;
    }
  }

  /**
   * 从主色调生成完整主题配置
   * 
   * @param primaryColor - 主色调（十六进制格式）
   * @param options - 生成选项
   * @returns 主题配置对象
   */
  public generateThemeFromColor(
    primaryColor: string,
    options: Partial<StyleGenerationOptions> = {}
  ): ThemeConfig {
    const {
      mode = 'light',
      contrast = 1,
      saturation = 1,
    } = options;

    // 解析主色调
    const primary = chroma(primaryColor);
    const isLight = mode === 'light' || (mode === 'auto' && primary.luminance() > 0.5);

    // 生成配色方案
    const colors = this.generateColorScheme(primary, isLight, saturation);

    // 根据模式生成地图元素颜色
    const themeColors = this.generateMapColors(primary, isLight, contrast);

    return {
      name: `自定义主题 - ${primaryColor}`,
      primaryColor: primaryColor,
      backgroundColor: themeColors.background,
      waterColor: themeColors.water,
      landColor: themeColors.land,
      roadColor: themeColors.road,
      buildingColor: themeColors.building,
      textColor: themeColors.text,
      textHaloColor: themeColors.textHalo,
      boundaryColor: themeColors.boundary,
      parkColor: themeColors.park,
      colorScheme: {
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent,
        neutral: colors.neutral,
        semantic: {
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
      },
      typography: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        headingFontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        monoFontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
        fontSizeScale: 1,
        fontWeights: {
          light: 300,
          regular: 400,
          medium: 500,
          bold: 700,
          black: 900,
        },
        lineHeights: {
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.75,
        },
      },
    };
  }

  /**
   * 生成色板
   * 
   * @param baseColor - 基础颜色
   * @param isLight - 是否为浅色模式
   * @param saturation - 饱和度调整
   * @returns 包含多个色板的对象
   */
  private generateColorScheme(
    baseColor: chroma.Color,
    isLight: boolean,
    saturation: number
  ): {
    primary: ColorPalette;
    secondary: ColorPalette;
    accent: ColorPalette;
    neutral: ColorPalette;
  } {
    // 生成主色板
    const primary = this.generatePalette(baseColor.hex(), saturation);

    // 生成次要色（色相偏移 30 度）
    const secondaryHue = (baseColor.hsl()[0] + 30) % 360;
    const secondary = this.generatePalette(
      chroma.hsl(secondaryHue, baseColor.hsl()[1], baseColor.hsl()[2]).hex(),
      saturation
    );

    // 生成强调色（互补色）
    const accentHue = (baseColor.hsl()[0] + 180) % 360;
    const accent = this.generatePalette(
      chroma.hsl(accentHue, baseColor.hsl()[1], baseColor.hsl()[2]).hex(),
      saturation
    );

    // 生成中性色
    const neutral = this.generateNeutralPalette(isLight);

    return { primary, secondary, accent, neutral };
  }

  /**
   * 生成单个色板
   * 
   * @param baseColor - 基础颜色
   * @param saturation - 饱和度调整
   * @returns 色板对象
   */
  private generatePalette(baseColor: string, saturation: number): ColorPalette {
    const base = chroma(baseColor);
    const [h, s, l] = base.hsl();
    const adjustedS = Math.min(1, s * saturation);

    return {
      50: chroma.hsl(h, adjustedS * 0.3, 0.97).hex(),
      100: chroma.hsl(h, adjustedS * 0.4, 0.93).hex(),
      200: chroma.hsl(h, adjustedS * 0.5, 0.86).hex(),
      300: chroma.hsl(h, adjustedS * 0.6, 0.76).hex(),
      400: chroma.hsl(h, adjustedS * 0.8, 0.62).hex(),
      500: chroma.hsl(h, adjustedS, l).hex(),
      600: chroma.hsl(h, adjustedS * 1.1, 0.42).hex(),
      700: chroma.hsl(h, adjustedS * 1.1, 0.35).hex(),
      800: chroma.hsl(h, adjustedS * 1.0, 0.28).hex(),
      900: chroma.hsl(h, adjustedS * 0.9, 0.20).hex(),
    };
  }

  /**
   * 生成中性色板
   * 
   * @param isLight - 是否为浅色模式
   * @returns 中性色板对象
   */
  private generateNeutralPalette(isLight: boolean): ColorPalette {
    if (isLight) {
      return {
        50: '#FAFAFA',
        100: '#F4F4F5',
        200: '#E4E4E7',
        300: '#D4D4D8',
        400: '#A1A1AA',
        500: '#71717A',
        600: '#52525B',
        700: '#3F3F46',
        800: '#27272A',
        900: '#18181B',
      };
    }
    // 深色模式 - 反转
    return {
      50: '#18181B',
      100: '#27272A',
      200: '#3F3F46',
      300: '#52525B',
      400: '#71717A',
      500: '#A1A1AA',
      600: '#D4D4D8',
      700: '#E4E4E7',
      800: '#F4F4F5',
      900: '#FAFAFA',
    };
  }

  /**
   * 生成地图元素颜色
   * 
   * @param primary - 主色调
   * @param isLight - 是否为浅色模式
   * @param contrast - 对比度
   * @returns 地图元素颜色配置
   */
  private generateMapColors(
    primary: chroma.Color,
    isLight: boolean,
    contrast: number
  ): StyleThemeColors {
    const [h] = primary.hsl();

    if (isLight) {
      return {
        primary: primary.hex(),
        background: chroma.hsl(h, 0.05, 0.98 * contrast).hex(),
        water: chroma.hsl(210, 0.6, 0.75).hex(),
        land: chroma.hsl(h, 0.03, 0.96 * contrast).hex(),
        road: '#FFFFFF',
        building: chroma.hsl(h, 0.05, 0.90 * contrast).hex(),
        text: chroma.hsl(h, 0.1, 0.15 / contrast).hex(),
        textHalo: '#FFFFFF',
        boundary: chroma.hsl(h, 0.1, 0.65).hex(),
        park: chroma.hsl(120, 0.35, 0.75).hex(),
      };
    }

    // 深色模式
    return {
      primary: primary.brighten(0.5).hex(),
      background: chroma.hsl(h, 0.08, 0.08 / contrast).hex(),
      water: chroma.hsl(210, 0.5, 0.25).hex(),
      land: chroma.hsl(h, 0.06, 0.12 / contrast).hex(),
      road: chroma.hsl(h, 0.05, 0.20).hex(),
      building: chroma.hsl(h, 0.08, 0.18 / contrast).hex(),
      text: chroma.hsl(h, 0.05, 0.85 * contrast).hex(),
      textHalo: chroma.hsl(h, 0.1, 0.15).hex(),
      boundary: chroma.hsl(h, 0.15, 0.40).hex(),
      park: chroma.hsl(120, 0.25, 0.30).hex(),
    };
  }

  /**
   * 从图片提取主色调
   * 
   * @param imageUrl - 图片 URL
   * @returns 提取的颜色数组（按主导程度排序）
   */
  public async extractColorsFromImage(imageUrl: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          // 创建 canvas 读取像素
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('无法创建 Canvas 上下文'));
            return;
          }

          // 缩小图片以提高性能
          const maxSize = 100;
          const scale = Math.min(maxSize / img.width, maxSize / img.height);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const colors = this.extractDominantColors(imageData.data);
          
          resolve(colors);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };

      img.src = imageUrl;
    });
  }

  /**
   * 从像素数据提取主导颜色
   * 
   * @param pixels - 像素数据数组
   * @returns 主导颜色数组
   */
  private extractDominantColors(pixels: Uint8ClampedArray): string[] {
    const colorMap = new Map<string, number>();
    
    // 统计颜色频率（量化到 32 级）
    for (let i = 0; i < pixels.length; i += 4) {
      const r = Math.round((pixels[i] ?? 0) / 32) * 32;
      const g = Math.round((pixels[i + 1] ?? 0) / 32) * 32;
      const b = Math.round((pixels[i + 2] ?? 0) / 32) * 32;
      const a = pixels[i + 3] ?? 255;
      
      // 忽略透明像素
      if (a < 128) continue;
      
      const key = `${r},${g},${b}`;
      colorMap.set(key, (colorMap.get(key) ?? 0) + 1);
    }

    // 按频率排序并转换为十六进制
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([colorKey]) => {
        const [r, g, b] = colorKey.split(',').map(Number);
        return chroma(r ?? 0, g ?? 0, b ?? 0).hex();
      });

    // 过滤掉过于接近黑色或白色的颜色
    const filteredColors = sortedColors.filter(color => {
      const luminance = chroma(color).luminance();
      return luminance > 0.05 && luminance < 0.95;
    });

    return filteredColors.length > 0 ? filteredColors : sortedColors;
  }

  /**
   * 应用主题到 MapLibre 样式
   * 
   * @param baseStyle - 基础样式对象
   * @param theme - 主题配置
   * @returns 修改后的样式对象
   */
  public applyThemeToStyle(
    baseStyle: MapStyle,
    theme: ThemeConfig
  ): MapStyle {
    // 深拷贝样式对象
    const style = JSON.parse(JSON.stringify(baseStyle)) as MapStyle;
    
    // 应用主题配置
    style.theme = theme;
    
    // 遍历图层应用颜色
    style.layers = style.layers.map((layer: StyleLayer) => {
      const modifiedLayer = { ...layer };
      
      // 根据图层类型应用颜色
      switch (layer.type) {
        case 'background':
          modifiedLayer.paint = {
            ...modifiedLayer.paint,
            'background-color': theme.backgroundColor,
          };
          break;
          
        case 'fill':
          if (layer.id.includes('water')) {
            modifiedLayer.paint = {
              ...modifiedLayer.paint,
              'fill-color': theme.waterColor,
            };
          } else if (layer.id.includes('park') || layer.id.includes('green')) {
            modifiedLayer.paint = {
              ...modifiedLayer.paint,
              'fill-color': theme.parkColor,
            };
          } else if (layer.id.includes('building')) {
            modifiedLayer.paint = {
              ...modifiedLayer.paint,
              'fill-color': theme.buildingColor,
            };
          } else if (layer.id.includes('land')) {
            modifiedLayer.paint = {
              ...modifiedLayer.paint,
              'fill-color': theme.landColor,
            };
          }
          break;
          
        case 'line':
          if (layer.id.includes('road') || layer.id.includes('street')) {
            modifiedLayer.paint = {
              ...modifiedLayer.paint,
              'line-color': theme.roadColor,
            };
          } else if (layer.id.includes('boundary') || layer.id.includes('border')) {
            modifiedLayer.paint = {
              ...modifiedLayer.paint,
              'line-color': theme.boundaryColor,
            };
          }
          break;
          
        case 'symbol':
          modifiedLayer.paint = {
            ...modifiedLayer.paint,
            'text-color': theme.textColor,
            'text-halo-color': theme.textHaloColor,
          };
          break;
          
        case 'fill-extrusion':
          modifiedLayer.paint = {
            ...modifiedLayer.paint,
            'fill-extrusion-color': theme.buildingColor,
          };
          break;
      }
      
      return modifiedLayer;
    });
    
    return style;
  }

  /**
   * 获取样式的归属信息
   * 
   * @param styleId - 样式 ID
   * @returns 归属信息字符串
   */
  public getAttribution(styleId: PresetStyleId): string {
    const preset = this.getPresetStyle(styleId);
    return preset?.attribution ?? '© OpenStreetMap contributors';
  }

  /**
   * 清除样式缓存
   */
  public clearCache(): void {
    this.styleCache.clear();
  }

  /**
   * 销毁服务实例
   */
  public destroy(): void {
    this.clearCache();
    MapStyleService.instance = null;
  }
}

/**
 * 导出服务单例
 */
export const mapStyleService = MapStyleService.getInstance();

export default MapStyleService;
