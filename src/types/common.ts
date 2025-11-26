/**
 * 通用类型定义
 * 定义全局通用的类型和接口
 */

/**
 * 唯一标识符类型
 */
export type UniqueId = string;

/**
 * 时间戳类型（毫秒）
 */
export type Timestamp = number;

/**
 * 二维坐标点
 */
export interface Point2D {
  /** X 坐标 */
  x: number;
  /** Y 坐标 */
  y: number;
}

/**
 * 三维坐标点
 */
export interface Point3D extends Point2D {
  /** Z 坐标（高度） */
  z: number;
}

/**
 * 地理坐标
 */
export interface GeoCoordinate {
  /** 经度（-180 到 180） */
  longitude: number;
  /** 纬度（-90 到 90） */
  latitude: number;
  /** 海拔高度（可选，单位：米） */
  altitude?: number;
}

/**
 * 边界框
 */
export interface BoundingBox {
  /** 西边界（最小经度） */
  west: number;
  /** 南边界（最小纬度） */
  south: number;
  /** 东边界（最大经度） */
  east: number;
  /** 北边界（最大纬度） */
  north: number;
}

/**
 * 尺寸
 */
export interface Size {
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
}

/**
 * 矩形区域
 */
export interface Rect extends Point2D, Size {}

/**
 * RGBA 颜色
 */
export interface RGBAColor {
  /** 红色通道 (0-255) */
  r: number;
  /** 绿色通道 (0-255) */
  g: number;
  /** 蓝色通道 (0-255) */
  b: number;
  /** 透明度 (0-1) */
  a: number;
}

/**
 * 颜色类型（支持多种格式）
 */
export type Color = string | RGBAColor;

/**
 * 时间范围
 */
export interface TimeRange {
  /** 开始时间（毫秒） */
  startMs: number;
  /** 结束时间（毫秒） */
  endMs: number;
}

/**
 * 键值对
 */
export interface KeyValue<T = unknown> {
  key: string;
  value: T;
}

/**
 * 分页参数
 */
export interface PaginationParams {
  /** 页码（从 1 开始） */
  page: number;
  /** 每页数量 */
  pageSize: number;
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  /** 数据列表 */
  items: T[];
  /** 总数量 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  pageSize: number;
  /** 总页数 */
  totalPages: number;
}

/**
 * 异步操作状态
 */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * 异步操作状态对象
 */
export interface AsyncState<T, E = Error> {
  /** 状态 */
  status: AsyncStatus;
  /** 数据 */
  data: T | null;
  /** 错误信息 */
  error: E | null;
}

/**
 * 排序方向
 */
export type SortDirection = 'asc' | 'desc';

/**
 * 排序配置
 */
export interface SortConfig {
  /** 排序字段 */
  field: string;
  /** 排序方向 */
  direction: SortDirection;
}

/**
 * 操作结果
 */
export interface OperationResult<T = void> {
  /** 是否成功 */
  success: boolean;
  /** 结果数据 */
  data?: T;
  /** 错误消息 */
  message?: string;
  /** 错误代码 */
  code?: string;
}

/**
 * 可选值类型
 * 用于表示可能为 null 或 undefined 的值
 */
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * 深度部分类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 选取必需字段
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * 排除字段
 */
export type OmitFields<T, K extends keyof T> = Omit<T, K>;

/**
 * 事件处理器类型
 */
export type EventHandler<T = void> = (event: T) => void;

/**
 * 回调函数类型
 */
export type Callback<T = void> = () => T;

/**
 * 异步回调函数类型
 */
export type AsyncCallback<T = void> = () => Promise<T>;

/**
 * 可取消的 Promise
 */
export interface CancellablePromise<T> extends Promise<T> {
  cancel: () => void;
}

/**
 * 订阅取消函数
 */
export type Unsubscribe = () => void;

/**
 * 可释放资源接口
 */
export interface Disposable {
  dispose: () => void;
}
