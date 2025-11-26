/**
 * 历史记录管理器
 * 实现撤销/重做功能
 */

/** 历史记录项 */
export interface HistoryEntry<T = unknown> {
  /** 记录 ID */
  id: string;
  /** 操作类型 */
  type: string;
  /** 操作描述 */
  description: string;
  /** 操作前的状态 */
  beforeState: T;
  /** 操作后的状态 */
  afterState: T;
  /** 时间戳 */
  timestamp: number;
  /** 是否可合并 */
  mergeable?: boolean;
}

/** 历史管理器配置 */
export interface HistoryConfig {
  /** 最大历史记录数量 */
  maxEntries: number;
  /** 合并相似操作的时间窗口 (ms) */
  mergeWindow: number;
  /** 是否启用 */
  enabled: boolean;
}

/** 历史事件类型 */
export type HistoryEvent = 'push' | 'undo' | 'redo' | 'clear';

/** 历史事件回调 */
export type HistoryEventCallback<T = unknown> = (
  event: HistoryEvent,
  entry?: HistoryEntry<T>
) => void;

/**
 * HistoryManager - 历史记录管理器
 * 
 * 功能：
 * 1. 记录操作历史
 * 2. 撤销/重做操作
 * 3. 相似操作合并
 * 4. 事件通知
 */
export class HistoryManager<T = unknown> {
  /** 配置 */
  private config: HistoryConfig;
  
  /** 撤销栈 */
  private undoStack: HistoryEntry<T>[] = [];
  
  /** 重做栈 */
  private redoStack: HistoryEntry<T>[] = [];
  
  /** 事件监听器 */
  private listeners: Set<HistoryEventCallback<T>> = new Set();
  
  /** 是否正在执行撤销/重做 */
  private isExecuting = false;
  
  /** ID 计数器 */
  private idCounter = 0;

  /**
   * 构造函数
   * @param config - 配置
   */
  constructor(config?: Partial<HistoryConfig>) {
    this.config = {
      maxEntries: 100,
      mergeWindow: 500,
      enabled: true,
      ...config,
    };
  }

  /**
   * 记录操作
   * @param type - 操作类型
   * @param description - 操作描述
   * @param beforeState - 操作前状态
   * @param afterState - 操作后状态
   * @param mergeable - 是否可合并
   */
  push(
    type: string,
    description: string,
    beforeState: T,
    afterState: T,
    mergeable = false
  ): void {
    if (!this.config.enabled || this.isExecuting) return;

    const now = Date.now();
    
    // 尝试合并相似操作
    if (mergeable && this.undoStack.length > 0) {
      const lastEntry = this.undoStack[this.undoStack.length - 1];
      if (lastEntry) {
        const timeDiff = now - lastEntry.timestamp;
        
        if (
          lastEntry.type === type &&
          lastEntry.mergeable &&
          timeDiff < this.config.mergeWindow
        ) {
          // 合并操作：保留最早的 beforeState，更新 afterState
          lastEntry.afterState = afterState;
          lastEntry.timestamp = now;
          lastEntry.description = description;
          
          // 清空重做栈
          this.redoStack = [];
          this.emit('push', lastEntry);
          return;
        }
      }
    }

    // 创建新记录
    const entry: HistoryEntry<T> = {
      id: `history-${++this.idCounter}`,
      type,
      description,
      beforeState,
      afterState,
      timestamp: now,
      mergeable,
    };

    this.undoStack.push(entry);
    
    // 清空重做栈
    this.redoStack = [];

    // 限制历史记录数量
    while (this.undoStack.length > this.config.maxEntries) {
      this.undoStack.shift();
    }

    this.emit('push', entry);
  }

  /**
   * 撤销操作
   * @returns 撤销的状态，如果没有可撤销的操作则返回 undefined
   */
  undo(): T | undefined {
    if (!this.canUndo()) return undefined;

    this.isExecuting = true;
    try {
      const entry = this.undoStack.pop()!;
      this.redoStack.push(entry);
      this.emit('undo', entry);
      return entry.beforeState;
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * 重做操作
   * @returns 重做的状态，如果没有可重做的操作则返回 undefined
   */
  redo(): T | undefined {
    if (!this.canRedo()) return undefined;

    this.isExecuting = true;
    try {
      const entry = this.redoStack.pop()!;
      this.undoStack.push(entry);
      this.emit('redo', entry);
      return entry.afterState;
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * 是否可以撤销
   */
  canUndo(): boolean {
    return this.config.enabled && this.undoStack.length > 0;
  }

  /**
   * 是否可以重做
   */
  canRedo(): boolean {
    return this.config.enabled && this.redoStack.length > 0;
  }

  /**
   * 获取撤销栈大小
   */
  getUndoCount(): number {
    return this.undoStack.length;
  }

  /**
   * 获取重做栈大小
   */
  getRedoCount(): number {
    return this.redoStack.length;
  }

  /**
   * 获取撤销栈描述列表
   */
  getUndoDescriptions(): string[] {
    return this.undoStack.map((entry) => entry.description).reverse();
  }

  /**
   * 获取重做栈描述列表
   */
  getRedoDescriptions(): string[] {
    return this.redoStack.map((entry) => entry.description).reverse();
  }

  /**
   * 获取最近的操作
   */
  getLastEntry(): HistoryEntry<T> | undefined {
    return this.undoStack[this.undoStack.length - 1];
  }

  /**
   * 清空历史记录
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.emit('clear');
  }

  /**
   * 添加事件监听器
   * @param callback - 回调函数
   */
  on(callback: HistoryEventCallback<T>): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * 移除事件监听器
   * @param callback - 回调函数
   */
  off(callback: HistoryEventCallback<T>): void {
    this.listeners.delete(callback);
  }

  /**
   * 触发事件
   * @param event - 事件类型
   * @param entry - 历史记录项
   */
  private emit(event: HistoryEvent, entry?: HistoryEntry<T>): void {
    this.listeners.forEach((callback) => {
      try {
        callback(event, entry);
      } catch (error) {
        console.error('[HistoryManager] 事件处理器错误:', error);
      }
    });
  }

  /**
   * 启用历史记录
   */
  enable(): void {
    this.config.enabled = true;
  }

  /**
   * 禁用历史记录
   */
  disable(): void {
    this.config.enabled = false;
  }

  /**
   * 是否启用
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * 设置最大记录数
   * @param max - 最大数量
   */
  setMaxEntries(max: number): void {
    this.config.maxEntries = max;
    while (this.undoStack.length > max) {
      this.undoStack.shift();
    }
  }

  /**
   * 批量操作开始
   * 在批量操作期间，所有操作将被合并为一个历史记录
   */
  beginBatch(_type: string, _description: string): void {
    this.isExecuting = true;
  }

  /**
   * 批量操作结束
   * @param beforeState - 批量操作前的状态
   * @param afterState - 批量操作后的状态
   */
  endBatch(type: string, description: string, beforeState: T, afterState: T): void {
    this.isExecuting = false;
    this.push(type, description, beforeState, afterState, false);
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clear();
    this.listeners.clear();
  }
}

export default HistoryManager;
