/**
 * 项目相关类型定义
 * 定义项目、场景、时间线等核心数据结构
 */

import type { UniqueId, Timestamp, GeoCoordinate, BoundingBox } from './common';
import type { MapStyle } from './style';
import type { TimelineItem } from './timeline';

/**
 * 项目状态枚举
 */
export type ProjectStatus = 'draft' | 'active' | 'archived';

/**
 * 项目元数据
 */
export interface ProjectMeta {
  /** 项目标题 */
  title: string;
  /** 项目描述 */
  description?: string;
  /** 标签列表 */
  tags?: string[];
  /** 缩略图 URL */
  thumbnailUrl?: string;
  /** 创建时间 */
  createdAt: Timestamp;
  /** 更新时间 */
  updatedAt: Timestamp;
  /** 项目时长（毫秒） */
  durationMs: number;
  /** 帧率 */
  frameRate: number;
  /** 分辨率宽度 */
  width: number;
  /** 分辨率高度 */
  height: number;
}

/**
 * 项目接口
 * 表示一个完整的地图动画项目
 */
export interface Project {
  /** 项目唯一标识 */
  id: UniqueId;
  /** 项目版本号 */
  version: number;
  /** 项目状态 */
  status: ProjectStatus;
  /** 项目元数据 */
  meta: ProjectMeta;
  /** 场景列表 */
  scenes: Scene[];
  /** 全局样式配置 */
  style: MapStyle;
  /** 全局资源引用 */
  assets: AssetReference[];
}

/**
 * 场景接口
 * 表示项目中的一个场景（可包含多个场景）
 */
export interface Scene {
  /** 场景唯一标识 */
  id: UniqueId;
  /** 场景名称 */
  name: string;
  /** 场景索引（排序用） */
  index: number;
  /** 场景时长（毫秒） */
  durationMs: number;
  /** 默认相机配置 */
  cameraDefaults: CameraConfig;
  /** 时间线条目列表 */
  items: TimelineItem[];
  /** 场景边界 */
  bounds?: BoundingBox;
}

/**
 * 相机配置
 * 定义地图视角参数
 */
export interface CameraConfig {
  /** 中心点坐标 */
  center: GeoCoordinate;
  /** 缩放级别 (0-22) */
  zoom: number;
  /** 俯仰角度 (0-85) */
  pitch: number;
  /** 方位角度 (0-360) */
  bearing: number;
  /** 视野范围（可选） */
  bounds?: BoundingBox;
}

/**
 * 资源引用
 * 表示项目中使用的外部资源
 */
export interface AssetReference {
  /** 资源唯一标识 */
  id: UniqueId;
  /** 资源类型 */
  type: AssetType;
  /** 资源名称 */
  name: string;
  /** 资源 URL */
  url: string;
  /** 资源元数据 */
  meta?: Record<string, unknown>;
}

/**
 * 资源类型枚举
 */
export type AssetType = 
  | 'icon'      // 图标
  | 'image'     // 图片
  | 'font'      // 字体
  | 'geojson'   // GeoJSON 数据
  | 'csv'       // CSV 数据
  | 'audio'     // 音频
  | 'video';    // 视频

/**
 * 项目快照
 * 用于版本历史和撤销/重做
 */
export interface ProjectSnapshot {
  /** 快照唯一标识 */
  id: UniqueId;
  /** 项目标识 */
  projectId: UniqueId;
  /** 快照名称 */
  name: string;
  /** 快照描述 */
  description?: string;
  /** 创建时间 */
  createdAt: Timestamp;
  /** 项目数据（序列化后） */
  data: string;
}

/**
 * 项目分享配置
 */
export interface ProjectShareConfig {
  /** 分享链接 */
  shareUrl: string;
  /** 是否公开 */
  isPublic: boolean;
  /** 访问密码（可选） */
  password?: string;
  /** 过期时间 */
  expiresAt?: Timestamp;
  /** 允许的操作 */
  permissions: SharePermission[];
}

/**
 * 分享权限枚举
 */
export type SharePermission = 'view' | 'comment' | 'edit' | 'export';

/**
 * 项目模板
 */
export interface ProjectTemplate {
  /** 模板唯一标识 */
  id: UniqueId;
  /** 模板名称 */
  name: string;
  /** 模板描述 */
  description: string;
  /** 模板分类 */
  category: TemplateCategory;
  /** 缩略图 URL */
  thumbnailUrl: string;
  /** 预览视频 URL */
  previewUrl?: string;
  /** 模板数据 */
  data: Omit<Project, 'id' | 'meta'>;
  /** 标签列表 */
  tags: string[];
  /** 是否为官方模板 */
  isOfficial: boolean;
  /** 使用次数 */
  usageCount: number;
}

/**
 * 模板分类枚举
 */
export type TemplateCategory = 
  | 'route'       // 路线动画
  | 'city'        // 城市介绍
  | 'event'       // 事件追踪
  | 'data'        // 数据可视化
  | 'brand'       // 品牌宣传
  | 'custom';     // 自定义

/**
 * 创建项目参数
 */
export interface CreateProjectParams {
  /** 项目标题 */
  title: string;
  /** 项目描述 */
  description?: string;
  /** 分辨率宽度 */
  width?: number;
  /** 分辨率高度 */
  height?: number;
  /** 帧率 */
  frameRate?: number;
  /** 模板 ID（从模板创建） */
  templateId?: UniqueId;
}

/**
 * 更新项目参数
 */
export interface UpdateProjectParams {
  /** 项目标题 */
  title?: string;
  /** 项目描述 */
  description?: string;
  /** 项目状态 */
  status?: ProjectStatus;
  /** 标签列表 */
  tags?: string[];
}
