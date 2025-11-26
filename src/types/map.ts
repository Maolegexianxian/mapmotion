/**
 * 地图相关类型定义
 * 定义地图图层、要素、标签等数据结构
 */

import type { UniqueId, GeoCoordinate, BoundingBox, Color } from './common';

/**
 * 图层类型枚举
 */
export type LayerType = 
  | 'camera'     // 镜头图层
  | 'path'       // 路径图层
  | 'label'      // 标签图层
  | 'marker'     // 标记图层
  | 'polygon'    // 多边形图层
  | 'line'       // 线条图层
  | 'heatmap'    // 热力图图层
  | 'cluster'    // 聚合图层
  | 'terrain'    // 地形图层
  | 'building'   // 建筑图层
  | 'overlay';   // 覆盖层图层

/**
 * 图层基础接口
 */
export interface Layer {
  /** 图层唯一标识 */
  id: UniqueId;
  /** 图层类型 */
  type: LayerType;
  /** 图层名称 */
  name: string;
  /** 是否可见 */
  visible: boolean;
  /** 是否锁定 */
  locked: boolean;
  /** 透明度 (0-1) */
  opacity: number;
  /** 图层顺序 */
  order: number;
  /** 混合模式 */
  blendMode?: BlendMode;
}

/**
 * 混合模式枚举
 */
export type BlendMode = 
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten';

/**
 * 地理要素类型枚举
 */
export type FeatureType = 'point' | 'line' | 'polygon' | 'multipoint' | 'multiline' | 'multipolygon';

/**
 * 地理要素基础接口
 */
export interface GeoFeature {
  /** 要素唯一标识 */
  id: UniqueId;
  /** 要素类型 */
  type: FeatureType;
  /** 要素名称 */
  name: string;
  /** 坐标数据 */
  coordinates: GeoCoordinate | GeoCoordinate[] | GeoCoordinate[][];
  /** 属性数据 */
  properties: Record<string, unknown>;
  /** 要素样式 */
  style?: FeatureStyle;
}

/**
 * 要素样式接口
 */
export interface FeatureStyle {
  /** 填充颜色 */
  fillColor?: Color;
  /** 填充透明度 */
  fillOpacity?: number;
  /** 描边颜色 */
  strokeColor?: Color;
  /** 描边宽度 */
  strokeWidth?: number;
  /** 描边透明度 */
  strokeOpacity?: number;
  /** 描边样式 */
  strokeDashArray?: number[];
  /** 图标 URL */
  iconUrl?: string;
  /** 图标大小 */
  iconSize?: number;
  /** 图标锚点 */
  iconAnchor?: [number, number];
}

/**
 * 标记点接口
 */
export interface Marker extends GeoFeature {
  type: 'point';
  /** 标记坐标 */
  coordinates: GeoCoordinate;
  /** 图标类型 */
  iconType?: MarkerIconType;
  /** 自定义图标 URL */
  customIconUrl?: string;
  /** 标签配置 */
  label?: LabelConfig;
  /** 是否可拖拽 */
  draggable?: boolean;
}

/**
 * 标记图标类型枚举
 */
export type MarkerIconType = 
  | 'default'
  | 'pin'
  | 'circle'
  | 'star'
  | 'flag'
  | 'custom';

/**
 * 路径接口
 */
export interface PathFeature extends GeoFeature {
  type: 'line';
  /** 路径坐标点 */
  coordinates: GeoCoordinate[];
  /** 路径类型 */
  pathType: PathType;
  /** 路径动画配置 */
  animation?: PathAnimation;
}

/**
 * 路径类型枚举
 */
export type PathType = 
  | 'driving'       // 驾车
  | 'walking'       // 步行
  | 'cycling'       // 骑行
  | 'flight'        // 航线
  | 'greatCircle'   // 大圆航线
  | 'custom';       // 自定义

/**
 * 路径动画配置
 */
export interface PathAnimation {
  /** 是否显示轨迹 */
  showTrail: boolean;
  /** 轨迹长度（0-1） */
  trailLength: number;
  /** 轨迹颜色 */
  trailColor: Color;
  /** 是否显示移动点 */
  showMovingPoint: boolean;
  /** 移动点图标 */
  movingPointIcon?: string;
  /** 移动点大小 */
  movingPointSize: number;
}

/**
 * 标签配置接口
 */
export interface LabelConfig {
  /** 标签文本 */
  text: string;
  /** 副标题 */
  subtitle?: string;
  /** 标签模板类型 */
  template: LabelTemplate;
  /** 位置偏移 */
  offset?: [number, number];
  /** 锚点位置 */
  anchor?: LabelAnchor;
  /** 是否自动避让 */
  autoAvoid?: boolean;
  /** 优先级（用于碰撞检测） */
  priority?: number;
  /** 是否锁定位置 */
  locked?: boolean;
  /** 样式配置 */
  style?: LabelStyle;
}

/**
 * 标签模板类型枚举
 */
export type LabelTemplate = 
  | 'city'          // 城市标签
  | 'poi'           // POI 标签
  | 'annotation'    // 注释标签
  | 'callout'       // 标注框
  | 'badge'         // 徽章
  | 'custom';       // 自定义

/**
 * 标签锚点位置枚举
 */
export type LabelAnchor = 
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

/**
 * 标签样式配置
 */
export interface LabelStyle {
  /** 字体大小 */
  fontSize: number;
  /** 字体粗细 */
  fontWeight: string | number;
  /** 字体颜色 */
  textColor: Color;
  /** 背景颜色 */
  backgroundColor?: Color;
  /** 边框颜色 */
  borderColor?: Color;
  /** 边框宽度 */
  borderWidth?: number;
  /** 圆角半径 */
  borderRadius?: number;
  /** 内边距 */
  padding?: number | [number, number] | [number, number, number, number];
  /** 阴影 */
  shadow?: boolean;
  /** 图标 URL */
  iconUrl?: string;
  /** 图标位置 */
  iconPosition?: 'left' | 'right' | 'top' | 'bottom';
}

/**
 * 搜索结果接口
 */
export interface SearchResult {
  /** 结果唯一标识 */
  id: UniqueId;
  /** 结果名称 */
  name: string;
  /** 完整地址 */
  address?: string;
  /** 坐标 */
  coordinate: GeoCoordinate;
  /** 边界框 */
  bounds?: BoundingBox;
  /** 类型 */
  type: SearchResultType;
  /** 重要性评分 */
  importance?: number;
  /** 附加属性 */
  properties?: Record<string, unknown>;
}

/**
 * 搜索结果类型枚举
 */
export type SearchResultType = 
  | 'country'
  | 'state'
  | 'city'
  | 'district'
  | 'street'
  | 'address'
  | 'poi'
  | 'natural'
  | 'other';

/**
 * 路线配置接口
 */
export interface RouteConfig {
  /** 起点 */
  origin: GeoCoordinate;
  /** 终点 */
  destination: GeoCoordinate;
  /** 途经点 */
  waypoints?: GeoCoordinate[];
  /** 出行方式 */
  travelMode: PathType;
  /** 避开选项 */
  avoid?: RouteAvoidOption[];
  /** 是否返回备选路线 */
  alternatives?: boolean;
}

/**
 * 路线避开选项枚举
 */
export type RouteAvoidOption = 'tolls' | 'highways' | 'ferries';

/**
 * 路线结果接口
 */
export interface RouteResult {
  /** 路线几何 */
  geometry: GeoCoordinate[];
  /** 总距离（米） */
  distance: number;
  /** 预计时间（秒） */
  duration: number;
  /** 路线步骤 */
  steps?: RouteStep[];
  /** 边界框 */
  bounds: BoundingBox;
}

/**
 * 路线步骤接口
 */
export interface RouteStep {
  /** 几何坐标 */
  geometry: GeoCoordinate[];
  /** 距离（米） */
  distance: number;
  /** 时间（秒） */
  duration: number;
  /** 导航指令 */
  instruction?: string;
  /** 道路名称 */
  roadName?: string;
}

/**
 * 地图视图状态
 */
export interface MapViewState {
  /** 中心点 */
  center: GeoCoordinate;
  /** 缩放级别 */
  zoom: number;
  /** 俯仰角 */
  pitch: number;
  /** 方位角 */
  bearing: number;
  /** 边界框 */
  bounds?: BoundingBox;
}

/**
 * 地图交互事件
 */
export interface MapInteractionEvent {
  /** 事件类型 */
  type: MapEventType;
  /** 屏幕坐标 */
  point: [number, number];
  /** 地理坐标 */
  lngLat: GeoCoordinate;
  /** 点击的要素 */
  features?: GeoFeature[];
  /** 原始事件 */
  originalEvent: MouseEvent | TouchEvent;
}

/**
 * 地图事件类型枚举
 */
export type MapEventType = 
  | 'click'
  | 'dblclick'
  | 'contextmenu'
  | 'mousemove'
  | 'mouseenter'
  | 'mouseleave'
  | 'dragstart'
  | 'drag'
  | 'dragend'
  | 'zoomstart'
  | 'zoom'
  | 'zoomend'
  | 'movestart'
  | 'move'
  | 'moveend'
  | 'rotatestart'
  | 'rotate'
  | 'rotateend'
  | 'pitchstart'
  | 'pitch'
  | 'pitchend';
