/**
 * 项目存储服务
 * 
 * @description
 * 提供项目的持久化存储功能，包括：
 * - 本地存储 (IndexedDB)
 * - 项目导入/导出
 * - 项目快照管理
 * - 自动保存
 * 
 * @module services/ProjectStorageService
 */

import type { Project, ProjectSnapshot, Scene } from '@/types/project';
import type { UniqueId } from '@/types/common';

/**
 * 存储配置
 */
interface StorageConfig {
  /** 数据库名称 */
  dbName: string;
  /** 数据库版本 */
  dbVersion: number;
  /** 项目存储名 */
  projectStoreName: string;
  /** 快照存储名 */
  snapshotStoreName: string;
  /** 自动保存间隔（毫秒） */
  autoSaveInterval: number;
  /** 最大快照数量 */
  maxSnapshots: number;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: StorageConfig = {
  dbName: 'mapmotion-projects',
  dbVersion: 1,
  projectStoreName: 'projects',
  snapshotStoreName: 'snapshots',
  autoSaveInterval: 30000, // 30 秒
  maxSnapshots: 10,
};

/**
 * 项目元数据
 */
export interface ProjectMetadata {
  /** 项目 ID */
  id: UniqueId;
  /** 项目名称 */
  name: string;
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
  /** 场景数量 */
  sceneCount: number;
  /** 总时长 */
  totalDuration: number;
  /** 缩略图 */
  thumbnailUrl?: string;
}

/**
 * 项目存储服务类
 */
export class ProjectStorageService {
  /** 单例实例 */
  private static instance: ProjectStorageService | null = null;
  
  /** 服务配置 */
  private config: StorageConfig;
  
  /** IndexedDB 数据库 */
  private db: IDBDatabase | null = null;
  
  /** 是否已初始化 */
  private initialized = false;
  
  /** 自动保存定时器 */
  private autoSaveTimer: number | null = null;
  
  /** 待保存的项目队列 */
  private pendingSaves: Map<UniqueId, Project> = new Map();

  /**
   * 私有构造函数
   */
  private constructor(config: Partial<StorageConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 获取服务单例
   */
  public static getInstance(config?: Partial<StorageConfig>): ProjectStorageService {
    if (!ProjectStorageService.instance) {
      ProjectStorageService.instance = new ProjectStorageService(config);
    }
    return ProjectStorageService.instance;
  }

  /**
   * 初始化数据库
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.dbVersion);

      request.onerror = () => {
        console.error('[ProjectStorageService] 数据库打开失败:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.initialized = true;
        this.startAutoSave();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 创建项目存储
        if (!db.objectStoreNames.contains(this.config.projectStoreName)) {
          const projectStore = db.createObjectStore(this.config.projectStoreName, { keyPath: 'id' });
          projectStore.createIndex('name', 'name', { unique: false });
          projectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // 创建快照存储
        if (!db.objectStoreNames.contains(this.config.snapshotStoreName)) {
          const snapshotStore = db.createObjectStore(this.config.snapshotStoreName, { keyPath: 'id' });
          snapshotStore.createIndex('projectId', 'projectId', { unique: false });
          snapshotStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  /**
   * 保存项目
   */
  public async saveProject(project: Project): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.config.projectStoreName, 'readwrite');
      const store = transaction.objectStore(this.config.projectStoreName);

      // 更新时间戳
      const updatedProject = {
        ...project,
        meta: {
          ...project.meta,
          updatedAt: Date.now(),
        },
      };

      const request = store.put(updatedProject);

      request.onerror = () => {
        console.error('[ProjectStorageService] 保存项目失败:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * 加载项目
   */
  public async loadProject(id: UniqueId): Promise<Project | null> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.config.projectStoreName, 'readonly');
      const store = transaction.objectStore(this.config.projectStoreName);
      const request = store.get(id);

      request.onerror = () => {
        console.error('[ProjectStorageService] 加载项目失败:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result ?? null);
      };
    });
  }

  /**
   * 获取所有项目元数据
   */
  public async listProjects(): Promise<ProjectMetadata[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.config.projectStoreName, 'readonly');
      const store = transaction.objectStore(this.config.projectStoreName);
      const request = store.getAll();

      request.onerror = () => {
        console.error('[ProjectStorageService] 获取项目列表失败:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        const projects = request.result as Project[];
        const metadata = projects.map((p) => this.extractMetadata(p));
        // 按更新时间倒序
        metadata.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(metadata);
      };
    });
  }

  /**
   * 删除项目
   */
  public async deleteProject(id: UniqueId): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.config.projectStoreName, this.config.snapshotStoreName],
        'readwrite'
      );

      // 删除项目
      const projectStore = transaction.objectStore(this.config.projectStoreName);
      projectStore.delete(id);

      // 删除相关快照
      const snapshotStore = transaction.objectStore(this.config.snapshotStoreName);
      const snapshotIndex = snapshotStore.index('projectId');
      const snapshotRequest = snapshotIndex.openCursor(IDBKeyRange.only(id));

      snapshotRequest.onsuccess = () => {
        const cursor = snapshotRequest.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      transaction.onerror = () => {
        console.error('[ProjectStorageService] 删除项目失败:', transaction.error);
        reject(transaction.error);
      };

      transaction.oncomplete = () => {
        resolve();
      };
    });
  }

  /**
   * 复制项目
   */
  public async duplicateProject(id: UniqueId, newName?: string): Promise<Project | null> {
    const original = await this.loadProject(id);
    if (!original) return null;

    const duplicate: Project = {
      ...original,
      id: this.generateId(),
      meta: {
        ...original.meta,
        title: newName ?? `${original.meta.title} (副本)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      scenes: original.scenes.map((scene) => ({
        ...scene,
        id: this.generateId(),
      })),
    };

    await this.saveProject(duplicate);
    return duplicate;
  }

  /**
   * 创建快照
   */
  public async createSnapshot(projectId: UniqueId, name?: string): Promise<ProjectSnapshot | null> {
    const project = await this.loadProject(projectId);
    if (!project) return null;

    await this.ensureInitialized();

    // 清理旧快照
    await this.cleanupOldSnapshots(projectId);

    const snapshot: ProjectSnapshot = {
      id: this.generateId(),
      projectId,
      name: name ?? `快照 ${new Date().toLocaleString()}`,
      createdAt: Date.now(),
      data: JSON.stringify(project),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.config.snapshotStoreName, 'readwrite');
      const store = transaction.objectStore(this.config.snapshotStoreName);
      const request = store.add(snapshot);

      request.onerror = () => {
        console.error('[ProjectStorageService] 创建快照失败:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(snapshot);
      };
    });
  }

  /**
   * 加载快照
   */
  public async loadSnapshot(snapshotId: UniqueId): Promise<Project | null> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.config.snapshotStoreName, 'readonly');
      const store = transaction.objectStore(this.config.snapshotStoreName);
      const request = store.get(snapshotId);

      request.onerror = () => {
        console.error('[ProjectStorageService] 加载快照失败:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        const snapshot = request.result as ProjectSnapshot | undefined;
        if (snapshot) {
          try {
            const project = JSON.parse(snapshot.data) as Project;
            resolve(project);
          } catch {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };
    });
  }

  /**
   * 获取项目的所有快照
   */
  public async listSnapshots(projectId: UniqueId): Promise<ProjectSnapshot[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.config.snapshotStoreName, 'readonly');
      const store = transaction.objectStore(this.config.snapshotStoreName);
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onerror = () => {
        console.error('[ProjectStorageService] 获取快照列表失败:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        const snapshots = request.result as ProjectSnapshot[];
        // 按创建时间倒序
        snapshots.sort((a, b) => b.createdAt - a.createdAt);
        resolve(snapshots);
      };
    });
  }

  /**
   * 导出项目为 JSON
   */
  public async exportProject(id: UniqueId): Promise<string | null> {
    const project = await this.loadProject(id);
    if (!project) return null;

    return JSON.stringify(project, null, 2);
  }

  /**
   * 从 JSON 导入项目
   */
  public async importProject(json: string, newName?: string): Promise<Project | null> {
    try {
      const project = JSON.parse(json) as Project;

      // 验证必要字段
      if (!project.meta?.title || !project.scenes) {
        throw new Error('无效的项目文件');
      }

      // 创建新项目
      const imported: Project = {
        ...project,
        id: this.generateId(),
        meta: {
          ...project.meta,
          title: newName ?? project.meta.title,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      };

      await this.saveProject(imported);
      return imported;
    } catch (error) {
      console.error('[ProjectStorageService] 导入项目失败:', error);
      return null;
    }
  }

  /**
   * 下载项目文件
   */
  public async downloadProject(id: UniqueId, filename?: string): Promise<void> {
    const json = await this.exportProject(id);
    if (!json) return;

    const project = await this.loadProject(id);
    const name = filename ?? `${project?.meta.title ?? 'project'}.mapmotion.json`;

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * 调度自动保存
   */
  public scheduleSave(project: Project): void {
    this.pendingSaves.set(project.id, project);
  }

  /**
   * 立即执行所有待保存的项目
   */
  public async flushPendingSaves(): Promise<void> {
    const projects = Array.from(this.pendingSaves.values());
    this.pendingSaves.clear();

    for (const project of projects) {
      try {
        await this.saveProject(project);
      } catch (error) {
        console.error('[ProjectStorageService] 自动保存失败:', error);
        // 重新加入队列
        this.pendingSaves.set(project.id, project);
      }
    }
  }

  /**
   * 提取项目元数据
   */
  private extractMetadata(project: Project): ProjectMetadata {
    const totalDuration = project.scenes.reduce(
      (sum: number, scene: Scene) => sum + (scene.durationMs ?? 0),
      0
    );

    const metadata: ProjectMetadata = {
      id: project.id,
      name: project.meta.title,
      createdAt: project.meta.createdAt,
      updatedAt: project.meta.updatedAt,
      sceneCount: project.scenes.length,
      totalDuration,
    };

    if (project.meta.thumbnailUrl) {
      metadata.thumbnailUrl = project.meta.thumbnailUrl;
    }

    return metadata;
  }

  /**
   * 清理旧快照
   */
  private async cleanupOldSnapshots(projectId: UniqueId): Promise<void> {
    const snapshots = await this.listSnapshots(projectId);
    
    if (snapshots.length >= this.config.maxSnapshots) {
      const toDelete = snapshots.slice(this.config.maxSnapshots - 1);
      
      const transaction = this.db!.transaction(this.config.snapshotStoreName, 'readwrite');
      const store = transaction.objectStore(this.config.snapshotStoreName);
      
      for (const snapshot of toDelete) {
        store.delete(snapshot.id);
      }
    }
  }

  /**
   * 启动自动保存
   */
  private startAutoSave(): void {
    if (this.autoSaveTimer) return;

    this.autoSaveTimer = window.setInterval(() => {
      this.flushPendingSaves();
    }, this.config.autoSaveInterval);
  }

  /**
   * 停止自动保存
   */
  private stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * 确保已初始化
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取存储使用情况
   */
  public async getStorageUsage(): Promise<{ used: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage ?? 0,
        quota: estimate.quota ?? 0,
      };
    }
    return { used: 0, quota: 0 };
  }

  /**
   * 清除所有数据
   */
  public async clearAllData(): Promise<void> {
    this.stopAutoSave();
    this.pendingSaves.clear();

    if (this.db) {
      this.db.close();
      this.db = null;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.config.dbName);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.initialized = false;
        resolve();
      };
    });
  }

  /**
   * 销毁服务
   */
  public destroy(): void {
    this.stopAutoSave();
    this.pendingSaves.clear();
    
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    
    this.initialized = false;
    ProjectStorageService.instance = null;
  }
}

/**
 * 导出服务单例
 */
export const projectStorageService = ProjectStorageService.getInstance();

export default ProjectStorageService;
