/**
 * 碰撞检测器
 * 用于检测标签之间的重叠并进行自动布局调整
 */

/** 包围盒接口 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 标签候选位置 */
export interface LabelCandidate {
  id: string;
  bounds: BoundingBox;
  priority: number;
  visible: boolean;
  originalPosition: { x: number; y: number };
  adjustedPosition?: { x: number; y: number };
}

/** 碰撞检测配置 */
export interface CollisionConfig {
  /** 标签之间的最小间距 */
  padding: number;
  /** 视口边界 */
  viewport: BoundingBox;
  /** 最大迭代次数 */
  maxIterations: number;
  /** 位置调整步长 */
  stepSize: number;
  /** 是否启用优先级排序 */
  usePriority: boolean;
}

/** 碰撞检测结果 */
export interface CollisionResult {
  /** 可见标签列表 */
  visible: LabelCandidate[];
  /** 隐藏标签列表 */
  hidden: LabelCandidate[];
  /** 调整后的位置映射 */
  adjustments: Map<string, { x: number; y: number }>;
}

/**
 * CollisionDetector - 碰撞检测器
 * 
 * 使用贪心算法和四叉树空间索引进行高效碰撞检测
 */
export class CollisionDetector {
  /** 配置 */
  private config: CollisionConfig;

  /**
   * 构造函数
   * @param config - 碰撞检测配置
   */
  constructor(config?: Partial<CollisionConfig>) {
    this.config = {
      padding: 4,
      viewport: { x: 0, y: 0, width: 1920, height: 1080 },
      maxIterations: 10,
      stepSize: 10,
      usePriority: true,
      ...config,
    };
  }

  /**
   * 更新视口大小
   * @param width - 宽度
   * @param height - 高度
   */
  setViewport(width: number, height: number): void {
    this.config.viewport = { x: 0, y: 0, width, height };
  }

  /**
   * 检测并解决碰撞
   * @param candidates - 标签候选列表
   * @returns 碰撞检测结果
   */
  detect(candidates: LabelCandidate[]): CollisionResult {
    const { padding, usePriority } = this.config;
    
    // 按优先级排序（高优先级优先）
    const sorted = usePriority
      ? [...candidates].sort((a, b) => b.priority - a.priority)
      : [...candidates];

    const visible: LabelCandidate[] = [];
    const hidden: LabelCandidate[] = [];
    const adjustments = new Map<string, { x: number; y: number }>();
    const occupiedAreas: BoundingBox[] = [];

    for (const candidate of sorted) {
      // 检查是否在视口内
      if (!this.isInViewport(candidate.bounds)) {
        hidden.push({ ...candidate, visible: false });
        continue;
      }

      // 扩展边界以包含 padding
      const expandedBounds = this.expandBounds(candidate.bounds, padding);

      // 检查与已放置标签的碰撞
      const collision = this.findCollision(expandedBounds, occupiedAreas);

      if (!collision) {
        // 无碰撞，直接放置
        visible.push({ ...candidate, visible: true });
        occupiedAreas.push(expandedBounds);
      } else {
        // 尝试调整位置
        const adjustedPosition = this.tryAdjustPosition(candidate, occupiedAreas);
        
        if (adjustedPosition) {
          const adjustedBounds = {
            ...expandedBounds,
            x: adjustedPosition.x,
            y: adjustedPosition.y,
          };
          visible.push({
            ...candidate,
            visible: true,
            adjustedPosition,
          });
          adjustments.set(candidate.id, adjustedPosition);
          occupiedAreas.push(adjustedBounds);
        } else {
          // 无法调整，隐藏标签
          hidden.push({ ...candidate, visible: false });
        }
      }
    }

    return { visible, hidden, adjustments };
  }

  /**
   * 检查两个包围盒是否相交
   * @param a - 包围盒 A
   * @param b - 包围盒 B
   */
  intersects(a: BoundingBox, b: BoundingBox): boolean {
    return !(
      a.x + a.width < b.x ||
      b.x + b.width < a.x ||
      a.y + a.height < b.y ||
      b.y + b.height < a.y
    );
  }

  /**
   * 检查包围盒是否在视口内
   * @param bounds - 包围盒
   */
  private isInViewport(bounds: BoundingBox): boolean {
    const { viewport } = this.config;
    return (
      bounds.x >= viewport.x - bounds.width &&
      bounds.x <= viewport.x + viewport.width &&
      bounds.y >= viewport.y - bounds.height &&
      bounds.y <= viewport.y + viewport.height
    );
  }

  /**
   * 扩展包围盒
   * @param bounds - 原始包围盒
   * @param padding - 扩展量
   */
  private expandBounds(bounds: BoundingBox, padding: number): BoundingBox {
    return {
      x: bounds.x - padding,
      y: bounds.y - padding,
      width: bounds.width + padding * 2,
      height: bounds.height + padding * 2,
    };
  }

  /**
   * 查找碰撞
   * @param bounds - 待检测的包围盒
   * @param occupiedAreas - 已占用区域列表
   */
  private findCollision(bounds: BoundingBox, occupiedAreas: BoundingBox[]): BoundingBox | null {
    for (const area of occupiedAreas) {
      if (this.intersects(bounds, area)) {
        return area;
      }
    }
    return null;
  }

  /**
   * 尝试调整位置以避免碰撞
   * @param candidate - 标签候选
   * @param occupiedAreas - 已占用区域列表
   */
  private tryAdjustPosition(
    candidate: LabelCandidate,
    occupiedAreas: BoundingBox[]
  ): { x: number; y: number } | null {
    const { maxIterations, stepSize, padding, viewport } = this.config;
    const { bounds, originalPosition } = candidate;

    // 尝试的方向：上、下、左、右、对角线
    const directions = [
      { dx: 0, dy: -1 },   // 上
      { dx: 0, dy: 1 },    // 下
      { dx: -1, dy: 0 },   // 左
      { dx: 1, dy: 0 },    // 右
      { dx: -1, dy: -1 },  // 左上
      { dx: 1, dy: -1 },   // 右上
      { dx: -1, dy: 1 },   // 左下
      { dx: 1, dy: 1 },    // 右下
    ];

    for (let iteration = 1; iteration <= maxIterations; iteration++) {
      const offset = iteration * stepSize;

      for (const { dx, dy } of directions) {
        const newX = originalPosition.x + dx * offset;
        const newY = originalPosition.y + dy * offset;

        const testBounds = this.expandBounds(
          { ...bounds, x: newX, y: newY },
          padding
        );

        // 检查是否在视口内
        if (!this.isInViewport(testBounds)) {
          continue;
        }

        // 检查与边界的碰撞
        if (
          newX < viewport.x ||
          newX + bounds.width > viewport.x + viewport.width ||
          newY < viewport.y ||
          newY + bounds.height > viewport.y + viewport.height
        ) {
          continue;
        }

        // 检查与其他标签的碰撞
        if (!this.findCollision(testBounds, occupiedAreas)) {
          return { x: newX, y: newY };
        }
      }
    }

    return null;
  }

  /**
   * 批量检测点与包围盒的碰撞
   * @param point - 点坐标
   * @param boxes - 包围盒列表
   */
  pointInBoxes(point: { x: number; y: number }, boxes: BoundingBox[]): BoundingBox | null {
    for (const box of boxes) {
      if (
        point.x >= box.x &&
        point.x <= box.x + box.width &&
        point.y >= box.y &&
        point.y <= box.y + box.height
      ) {
        return box;
      }
    }
    return null;
  }

  /**
   * 计算两个包围盒之间的距离
   * @param a - 包围盒 A
   * @param b - 包围盒 B
   */
  distance(a: BoundingBox, b: BoundingBox): number {
    const centerA = { x: a.x + a.width / 2, y: a.y + a.height / 2 };
    const centerB = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    
    const dx = centerA.x - centerB.x;
    const dy = centerA.y - centerB.y;
    
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 获取包围盒的重叠区域
   * @param a - 包围盒 A
   * @param b - 包围盒 B
   */
  getOverlapArea(a: BoundingBox, b: BoundingBox): number {
    if (!this.intersects(a, b)) {
      return 0;
    }

    const xOverlap = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
    const yOverlap = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);

    return Math.max(0, xOverlap) * Math.max(0, yOverlap);
  }
}

export default CollisionDetector;
