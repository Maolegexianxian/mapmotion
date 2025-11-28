/**
 * 服务层统一导出
 * 提供所有业务服务的统一访问入口
 */

// 地图样式服务
export { MapStyleService, mapStyleService } from './MapStyleService';
export type {
  MapStylePreset,
  StyleThemeColors,
  StyleGenerationOptions,
} from './MapStyleService';

// 地理编码服务
export { GeocodingService, geocodingService } from './GeocodingService';
export type {
  GeocodingResult,
  GeocodingOptions,
  ReverseGeocodingOptions,
} from './GeocodingService';

// 路线规划服务
export { RouteService, routeService } from './RouteService';
export type {
  RouteOptions,
  RouteResponse,
  RouteWaypoint,
} from './RouteService';

// 相机动画控制器
export { CameraAnimationController } from './CameraAnimationController';
export type {
  CameraAnimationConfig,
  CameraKeyframe,
  CameraAnimationType,
} from './CameraAnimationController';

// 路径动画引擎
export { PathAnimationEngine } from './PathAnimationEngine';
export type {
  PathAnimationConfig,
  PathAnimationState,
  PathPoint,
} from './PathAnimationEngine';

// 标签模板服务
export { LabelTemplateService, labelTemplateService } from './LabelTemplateService';
export type { LabelTemplate, LabelTemplateCategory } from './LabelTemplateService';

// 项目存储服务
export { ProjectStorageService, projectStorageService } from './ProjectStorageService';
export type { ProjectMetadata } from './ProjectStorageService';
