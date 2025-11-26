/**
 * 标签管理器
 * 整合标签渲染和碰撞检测，提供统一的标签管理接口
 */
import { LabelRenderer, type LabelRenderOptions } from './LabelRenderer';
import { CollisionDetector, type LabelCandidate, type CollisionConfig, type CollisionResult } from './CollisionDetector';
import type { LabelConfig, GeoCoordinate } from '@/types';

/** 标签数据 */
export interface LabelData {
  /** 标签配置 */
  config: LabelConfig;
  /** 地理坐标 */
  coordinate: GeoCoordinate;
  /** 优先级 */
  priority?: number;
  /** 是否锁定位置 */
  locked?: boolean;
}

/** 坐标转换函数类型 */
export type CoordinateProjector = (coord: GeoCoordinate) => { x: number; y: number } | null;

/** 标签管理器配置 */
export interface LabelManagerConfig {
  /** 容器元素 */
  container: HTMLElement;
  /** 坐标转换函数 */
  projector: CoordinateProjector;
  /** 碰撞检测配置 */
  collisionConfig?: Partial<CollisionConfig>;
  /** 渲染选项 */
  renderOptions?: LabelRenderOptions;
  /** 自动避让 */
  autoAvoid?: boolean;
  /** 更新节流时间 (ms) */
  throttleMs?: number;
}

/**
 * LabelManager - 标签管理器
 */
export class LabelManager {
  /** 配置 */
  private config: LabelManagerConfig;
  
  /** 标签渲染器 */
  private renderer: LabelRenderer;
  
  /** 碰撞检测器 */
  private detector: CollisionDetector;
  
  /** 标签数据映射 */
  private labels: Map<string, LabelData> = new Map();
  
  /** 上次更新时间 */
  private lastUpdateTime = 0;
  
  /** 更新定时器 */
  private updateTimer: number | null = null;
  
  /** 是否正在更新 */
  private isUpdating = false;

  /**
   * 构造函数
   * @param config - 管理器配置
   */
  constructor(config: LabelManagerConfig) {
    this.config = {
      autoAvoid: true,
      throttleMs: 16,
      ...config,
    };

    this.renderer = new LabelRenderer(config.container);
    this.detector = new CollisionDetector(config.collisionConfig);
  }

  /**
   * 添加标签
   * @param id - 标签 ID
   * @param data - 标签数据
   */
  addLabel(id: string, data: LabelData): void {
    this.labels.set(id, data);
    this.scheduleUpdate();
  }

  /**
   * 批量添加标签
   * @param labels - 标签数据数组
   */
  addLabels(labels: Array<{ id: string; data: LabelData }>): void {
    labels.forEach(({ id, data }) => this.labels.set(id, data));
    this.scheduleUpdate();
  }

  /**
   * 移除标签
   * @param id - 标签 ID
   */
  removeLabel(id: string): void {
    this.labels.delete(id);
    this.renderer.removeLabel(id);
  }

  /**
   * 更新标签
   * @param id - 标签 ID
   * @param data - 部分标签数据
   */
  updateLabel(id: string, data: Partial<LabelData>): void {
    const existing = this.labels.get(id);
    if (existing) {
      this.labels.set(id, { ...existing, ...data });
      this.scheduleUpdate();
    }
  }

  /**
   * 获取标签
   * @param id - 标签 ID
   */
  getLabel(id: string): LabelData | undefined {
    return this.labels.get(id);
  }

  /**
   * 获取所有标签 ID
   */
  getAllLabelIds(): string[] {
    return Array.from(this.labels.keys());
  }

  /**
   * 清除所有标签
   */
  clearAll(): void {
    this.labels.clear();
    this.renderer.clearAll();
  }

  /**
   * 更新坐标投影函数
   * @param projector - 新的投影函数
   */
  setProjector(projector: CoordinateProjector): void {
    this.config.projector = projector;
    this.scheduleUpdate();
  }

  /**
   * 更新视口大小
   * @param width - 宽度
   * @param height - 高度
   */
  setViewport(width: number, height: number): void {
    this.detector.setViewport(width, height);
    this.scheduleUpdate();
  }

  /**
   * 设置自动避让
   * @param enabled - 是否启用
   */
  setAutoAvoid(enabled: boolean): void {
    this.config.autoAvoid = enabled;
    this.scheduleUpdate();
  }

  /**
   * 调度更新
   */
  private scheduleUpdate(): void {
    const now = Date.now();
    const { throttleMs } = this.config;

    if (this.updateTimer !== null) {
      return;
    }

    const timeSinceLastUpdate = now - this.lastUpdateTime;
    const delay = Math.max(0, (throttleMs || 16) - timeSinceLastUpdate);

    this.updateTimer = window.setTimeout(() => {
      this.updateTimer = null;
      this.performUpdate();
    }, delay);
  }

  /**
   * 执行更新
   */
  private performUpdate(): void {
    if (this.isUpdating) return;
    this.isUpdating = true;

    try {
      const { projector, autoAvoid, renderOptions } = this.config;
      const candidates: LabelCandidate[] = [];
      const screenPositions = new Map<string, { x: number; y: number }>();

      // 计算所有标签的屏幕位置
      this.labels.forEach((data, id) => {
        const screenPos = projector(data.coordinate);
        if (!screenPos) return;

        screenPositions.set(id, screenPos);

        // 渲染标签以获取尺寸
        const rendered = this.renderer.renderLabel(
          data.config,
          screenPos.x,
          screenPos.y,
          { ...renderOptions, animated: false }
        );

        const bounds = rendered.element.getBoundingClientRect();
        // const containerRect = this.config.container.getBoundingClientRect();

        candidates.push({
          id,
          bounds: {
            x: screenPos.x,
            y: screenPos.y,
            width: bounds.width,
            height: bounds.height,
          },
          priority: data.priority ?? (data.config.priority ?? 0),
          visible: true,
          originalPosition: screenPos,
        });
      });

      // 碰撞检测和避让
      if (autoAvoid && candidates.length > 1) {
        const result = this.detector.detect(candidates);
        this.applyCollisionResult(result, screenPositions);
      } else {
        // 无需避让，直接更新位置
        this.updateAllPositions(screenPositions);
      }

      this.lastUpdateTime = Date.now();
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * 应用碰撞检测结果
   * @param result - 碰撞检测结果
   * @param originalPositions - 原始位置映射
   */
  private applyCollisionResult(
    result: CollisionResult,
    originalPositions: Map<string, { x: number; y: number }>
  ): void {
    const { renderOptions } = this.config;

    // 更新可见标签位置
    result.visible.forEach((candidate) => {
      const position = candidate.adjustedPosition || originalPositions.get(candidate.id);
      if (!position) return;

      const data = this.labels.get(candidate.id);
      if (!data) return;

      this.renderer.renderLabel(data.config, position.x, position.y, renderOptions);
      this.renderer.setLabelVisibility(candidate.id, true);
    });

    // 隐藏被遮挡的标签
    result.hidden.forEach((candidate) => {
      this.renderer.setLabelVisibility(candidate.id, false);
    });
  }

  /**
   * 更新所有标签位置
   * @param positions - 位置映射
   */
  private updateAllPositions(positions: Map<string, { x: number; y: number }>): void {
    const { renderOptions } = this.config;

    positions.forEach((position, id) => {
      const data = this.labels.get(id);
      if (!data) return;

      this.renderer.renderLabel(data.config, position.x, position.y, renderOptions);
      this.renderer.setLabelVisibility(id, true);
    });
  }

  /**
   * 强制刷新
   */
  forceUpdate(): void {
    if (this.updateTimer !== null) {
      clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }
    this.performUpdate();
  }

  /**
   * 获取渲染器
   */
  getRenderer(): LabelRenderer {
    return this.renderer;
  }

  /**
   * 获取检测器
   */
  getDetector(): CollisionDetector {
    return this.detector;
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    if (this.updateTimer !== null) {
      clearTimeout(this.updateTimer);
    }
    this.labels.clear();
    this.renderer.destroy();
  }
}

export default LabelManager;
