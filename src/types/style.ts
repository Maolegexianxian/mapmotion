/**
 * 样式相关类型定义
 * 定义地图样式、主题、配色等数据结构
 */

import type { UniqueId, Color, Timestamp } from './common';

/**
 * 地图样式接口
 * 完整的地图渲染样式配置
 */
export interface MapStyle {
  /** 样式唯一标识 */
  id: UniqueId;
  /** 样式名称 */
  name: string;
  /** 样式版本 */
  version: number;
  /** 数据源配置 */
  sources: Record<string, StyleSource>;
  /** 图层样式列表 */
  layers: StyleLayer[];
  /** 精灵图配置 */
  sprite?: string;
  /** 字体配置 */
  glyphs?: string;
  /** 元数据 */
  metadata?: Record<string, unknown>;
  /** 主题配置 */
  theme?: ThemeConfig;
}

/**
 * 样式数据源
 */
export interface StyleSource {
  /** 数据源类型 */
  type: SourceType;
  /** 瓦片 URL（vector/raster） */
  tiles?: string[];
  /** GeoJSON 数据 URL */
  url?: string;
  /** GeoJSON 数据 */
  data?: GeoJSON.GeoJSON;
  /** 最小缩放级别 */
  minzoom?: number;
  /** 最大缩放级别 */
  maxzoom?: number;
  /** 瓦片大小 */
  tileSize?: number;
  /** 属性信息 */
  attribution?: string;
}

/**
 * 数据源类型枚举
 */
export type SourceType = 
  | 'vector'
  | 'raster'
  | 'raster-dem'
  | 'geojson'
  | 'image'
  | 'video';

/**
 * 样式图层
 */
export interface StyleLayer {
  /** 图层 ID */
  id: string;
  /** 图层类型 */
  type: StyleLayerType;
  /** 数据源 */
  source?: string;
  /** 数据源图层 */
  'source-layer'?: string;
  /** 过滤条件 */
  filter?: unknown[];
  /** 布局属性 */
  layout?: Record<string, unknown>;
  /** 绘制属性 */
  paint?: Record<string, unknown>;
  /** 最小缩放级别 */
  minzoom?: number;
  /** 最大缩放级别 */
  maxzoom?: number;
  /** 元数据 */
  metadata?: Record<string, unknown>;
}

/**
 * 样式图层类型枚举
 */
export type StyleLayerType = 
  | 'background'
  | 'fill'
  | 'line'
  | 'symbol'
  | 'raster'
  | 'circle'
  | 'fill-extrusion'
  | 'heatmap'
  | 'hillshade'
  | 'sky';

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 主题名称 */
  name: string;
  /** 主色调 */
  primaryColor: Color;
  /** 背景色 */
  backgroundColor: Color;
  /** 水域颜色 */
  waterColor: Color;
  /** 陆地颜色 */
  landColor: Color;
  /** 道路颜色 */
  roadColor: Color;
  /** 建筑颜色 */
  buildingColor: Color;
  /** 文字颜色 */
  textColor: Color;
  /** 文字描边颜色 */
  textHaloColor: Color;
  /** 边界颜色 */
  boundaryColor: Color;
  /** 公园绿地颜色 */
  parkColor: Color;
  /** 配色方案 */
  colorScheme: ColorScheme;
  /** 字体配置 */
  typography: TypographyConfig;
}

/**
 * 配色方案
 */
export interface ColorScheme {
  /** 主色 */
  primary: ColorPalette;
  /** 次要色 */
  secondary: ColorPalette;
  /** 强调色 */
  accent: ColorPalette;
  /** 中性色 */
  neutral: ColorPalette;
  /** 语义色 */
  semantic: SemanticColors;
}

/**
 * 色板
 */
export interface ColorPalette {
  /** 50 - 最浅 */
  50: Color;
  /** 100 */
  100: Color;
  /** 200 */
  200: Color;
  /** 300 */
  300: Color;
  /** 400 */
  400: Color;
  /** 500 - 基础色 */
  500: Color;
  /** 600 */
  600: Color;
  /** 700 */
  700: Color;
  /** 800 */
  800: Color;
  /** 900 - 最深 */
  900: Color;
}

/**
 * 语义颜色
 */
export interface SemanticColors {
  /** 成功色 */
  success: Color;
  /** 警告色 */
  warning: Color;
  /** 错误色 */
  error: Color;
  /** 信息色 */
  info: Color;
}

/**
 * 字体配置
 */
export interface TypographyConfig {
  /** 主字体 */
  fontFamily: string;
  /** 标题字体 */
  headingFontFamily?: string;
  /** 代码字体 */
  monoFontFamily?: string;
  /** 字体大小比例 */
  fontSizeScale: number;
  /** 字重配置 */
  fontWeights: FontWeights;
  /** 行高配置 */
  lineHeights: LineHeights;
}

/**
 * 字重配置
 */
export interface FontWeights {
  /** 细体 */
  light: number;
  /** 常规 */
  regular: number;
  /** 中等 */
  medium: number;
  /** 粗体 */
  bold: number;
  /** 特粗 */
  black?: number;
}

/**
 * 行高配置
 */
export interface LineHeights {
  /** 紧凑 */
  tight: number;
  /** 正常 */
  normal: number;
  /** 宽松 */
  relaxed: number;
}

/**
 * 预设样式枚举
 */
export type PresetStyleId = 
  | 'light'           // 浅色
  | 'dark'            // 深色
  | 'satellite'       // 卫星图
  | 'streets'         // 街道图
  | 'outdoors'        // 户外地图
  | 'navigation'      // 导航样式
  | 'monochrome'      // 单色
  | 'blueprint'       // 蓝图风格
  | 'vintage'         // 复古风格
  | 'watercolor';     // 水彩风格

/**
 * 预设样式配置
 */
export interface PresetStyle {
  /** 预设 ID */
  id: PresetStyleId;
  /** 预设名称 */
  name: string;
  /** 预设描述 */
  description: string;
  /** 缩略图 URL */
  thumbnailUrl: string;
  /** 样式 URL */
  styleUrl: string;
  /** 是否收费 */
  isPremium: boolean;
  /** 数据源归属 */
  attribution: string;
}

/**
 * 自定义样式
 */
export interface CustomStyle {
  /** 样式 ID */
  id: UniqueId;
  /** 用户 ID */
  ownerId: UniqueId;
  /** 样式名称 */
  name: string;
  /** 基础样式 */
  baseStyle: PresetStyleId | UniqueId;
  /** 主题配置 */
  theme: ThemeConfig;
  /** 样式覆盖 */
  overrides?: Partial<MapStyle>;
  /** 创建时间 */
  createdAt: Timestamp;
  /** 更新时间 */
  updatedAt: Timestamp;
}

/**
 * 样式生成参数
 * 用于从图片或品牌色生成样式
 */
export interface StyleGenerationParams {
  /** 主色调 */
  primaryColor?: Color;
  /** 源图片 URL */
  imageUrl?: string;
  /** 明暗模式 */
  mode: 'light' | 'dark' | 'auto';
  /** 对比度 */
  contrast: number;
  /** 饱和度 */
  saturation: number;
}

/**
 * 样式预览配置
 */
export interface StylePreviewConfig {
  /** 预览中心点 */
  center: [number, number];
  /** 预览缩放级别 */
  zoom: number;
  /** 预览尺寸 */
  size: { width: number; height: number };
  /** 是否包含标签 */
  showLabels: boolean;
  /** 是否包含 3D */
  show3D: boolean;
}

/**
 * 数据可视化样式
 */
export interface DataVisualizationStyle {
  /** 可视化类型 */
  type: DataVisType;
  /** 颜色映射 */
  colorMapping: ColorMapping;
  /** 大小映射 */
  sizeMapping?: SizeMapping;
  /** 透明度映射 */
  opacityMapping?: OpacityMapping;
}

/**
 * 数据可视化类型枚举
 */
export type DataVisType = 
  | 'choropleth'    // 分级统计图
  | 'graduated'     // 等级符号图
  | 'heatmap'       // 热力图
  | 'cluster'       // 聚合图
  | 'bubble'        // 气泡图
  | 'flow';         // 流量图

/**
 * 颜色映射配置
 */
export interface ColorMapping {
  /** 映射类型 */
  type: 'continuous' | 'discrete' | 'categorical';
  /** 数据字段 */
  field: string;
  /** 颜色列表 */
  colors: Color[];
  /** 数值断点（continuous/discrete） */
  breaks?: number[];
  /** 分类值（categorical） */
  categories?: string[];
  /** 默认颜色 */
  defaultColor: Color;
  /** 空值颜色 */
  nullColor?: Color;
}

/**
 * 大小映射配置
 */
export interface SizeMapping {
  /** 数据字段 */
  field: string;
  /** 最小值 */
  minValue: number;
  /** 最大值 */
  maxValue: number;
  /** 最小大小 */
  minSize: number;
  /** 最大大小 */
  maxSize: number;
  /** 映射函数 */
  scale: 'linear' | 'sqrt' | 'log';
}

/**
 * 透明度映射配置
 */
export interface OpacityMapping {
  /** 数据字段 */
  field: string;
  /** 最小值 */
  minValue: number;
  /** 最大值 */
  maxValue: number;
  /** 最小透明度 */
  minOpacity: number;
  /** 最大透明度 */
  maxOpacity: number;
}
