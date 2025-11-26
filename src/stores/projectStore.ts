/**
 * 项目状态管理 Store
 * 使用 Zustand 管理项目数据的全局状态
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';

import type { Project, Scene, CreateProjectParams, CameraConfig } from '@/types';

/** 项目 Store 状态接口 */
interface ProjectState {
  /** 所有项目列表 */
  projects: Project[];
  /** 当前打开的项目 */
  currentProject: Project | null;
  /** 当前选中的场景索引 */
  currentSceneIndex: number;
  /** 是否有未保存的更改 */
  hasUnsavedChanges: boolean;
  /** 加载状态 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
}

/** 项目 Store 操作接口 */
interface ProjectActions {
  /** 创建新项目 */
  createNewProject: (params: CreateProjectParams) => Project;
  /** 加载项目 */
  loadProject: (projectId: string) => void;
  /** 保存当前项目 */
  saveProject: () => void;
  /** 更新项目元数据 */
  updateProjectMeta: (updates: Partial<Project['meta']>) => void;
  /** 删除项目 */
  deleteProject: (projectId: string) => void;
  /** 复制项目 */
  duplicateProject: (projectId: string) => Project | null;
  /** 添加场景 */
  addScene: (scene?: Partial<Scene>) => void;
  /** 删除场景 */
  removeScene: (sceneIndex: number) => void;
  /** 更新场景 */
  updateScene: (sceneIndex: number, updates: Partial<Scene>) => void;
  /** 切换当前场景 */
  setCurrentSceneIndex: (index: number) => void;
  /** 标记更改 */
  markAsChanged: () => void;
  /** 清除错误 */
  clearError: () => void;
}

/** 项目 Store 类型 */
type ProjectStore = ProjectState & ProjectActions;

/** 默认相机配置 */
const DEFAULT_CAMERA: CameraConfig = {
  center: { longitude: 116.4074, latitude: 39.9042 }, // 北京
  zoom: 10,
  pitch: 45,
  bearing: 0,
};

/** 创建默认场景 */
function createDefaultScene(index: number): Scene {
  return {
    id: nanoid(),
    name: `场景 ${index + 1}`,
    index,
    durationMs: 10000, // 10 秒
    cameraDefaults: { ...DEFAULT_CAMERA },
    items: [],
  };
}

/** 创建默认项目 */
function createDefaultProject(params: CreateProjectParams): Project {
  const now = Date.now();
  return {
    id: nanoid(),
    version: 1,
    status: 'draft',
    meta: {
      title: params.title || '未命名项目',
      description: params.description,
      createdAt: now,
      updatedAt: now,
      durationMs: 10000,
      frameRate: params.frameRate ?? 30,
      width: params.width ?? 1920,
      height: params.height ?? 1080,
    },
    scenes: [createDefaultScene(0)],
    style: {
      id: nanoid(),
      name: '默认样式',
      version: 1,
      sources: {},
      layers: [],
    },
    assets: [],
  };
}

/**
 * 项目状态管理 Store
 * 
 * @description
 * 使用 Zustand 创建的全局状态管理，集成了：
 * - immer: 支持不可变数据更新
 * - devtools: Redux DevTools 集成
 * - persist: 本地存储持久化
 */
export const useProjectStore = create<ProjectStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // 初始状态
        projects: [],
        currentProject: null,
        currentSceneIndex: 0,
        hasUnsavedChanges: false,
        isLoading: false,
        error: null,

        // 创建新项目
        createNewProject: (params) => {
          const newProject = createDefaultProject(params);
          set((state) => {
            state.projects.push(newProject);
            state.currentProject = newProject;
            state.currentSceneIndex = 0;
            state.hasUnsavedChanges = false;
          });
          return newProject;
        },

        // 加载项目
        loadProject: (projectId) => {
          const { projects } = get();
          const project = projects.find((p) => p.id === projectId);
          if (project) {
            set((state) => {
              state.currentProject = project;
              state.currentSceneIndex = 0;
              state.hasUnsavedChanges = false;
              state.error = null;
            });
          } else {
            set((state) => {
              state.error = '项目不存在';
            });
          }
        },

        // 保存项目
        saveProject: () => {
          const { currentProject, projects } = get();
          if (!currentProject) return;

          set((state) => {
            const index = state.projects.findIndex((p) => p.id === currentProject.id);
            if (index >= 0) {
              state.projects[index] = {
                ...currentProject,
                meta: {
                  ...currentProject.meta,
                  updatedAt: Date.now(),
                },
              };
            }
            state.hasUnsavedChanges = false;
          });
        },

        // 更新项目元数据
        updateProjectMeta: (updates) => {
          set((state) => {
            if (state.currentProject) {
              state.currentProject.meta = {
                ...state.currentProject.meta,
                ...updates,
                updatedAt: Date.now(),
              };
              state.hasUnsavedChanges = true;
            }
          });
        },

        // 删除项目
        deleteProject: (projectId) => {
          set((state) => {
            state.projects = state.projects.filter((p) => p.id !== projectId);
            if (state.currentProject?.id === projectId) {
              state.currentProject = null;
            }
          });
        },

        // 复制项目
        duplicateProject: (projectId) => {
          const { projects } = get();
          const project = projects.find((p) => p.id === projectId);
          if (!project) return null;

          const duplicated: Project = {
            ...JSON.parse(JSON.stringify(project)),
            id: nanoid(),
            meta: {
              ...project.meta,
              title: `${project.meta.title} (副本)`,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          };

          set((state) => {
            state.projects.push(duplicated);
          });

          return duplicated;
        },

        // 添加场景
        addScene: (sceneData) => {
          set((state) => {
            if (state.currentProject) {
              const newScene = {
                ...createDefaultScene(state.currentProject.scenes.length),
                ...sceneData,
              };
              state.currentProject.scenes.push(newScene);
              state.hasUnsavedChanges = true;
            }
          });
        },

        // 删除场景
        removeScene: (sceneIndex) => {
          set((state) => {
            if (state.currentProject && state.currentProject.scenes.length > 1) {
              state.currentProject.scenes.splice(sceneIndex, 1);
              // 重新索引
              state.currentProject.scenes.forEach((scene, i) => {
                scene.index = i;
              });
              // 调整当前场景索引
              if (state.currentSceneIndex >= state.currentProject.scenes.length) {
                state.currentSceneIndex = state.currentProject.scenes.length - 1;
              }
              state.hasUnsavedChanges = true;
            }
          });
        },

        // 更新场景
        updateScene: (sceneIndex, updates) => {
          set((state) => {
            if (state.currentProject && state.currentProject.scenes[sceneIndex]) {
              Object.assign(state.currentProject.scenes[sceneIndex], updates);
              state.hasUnsavedChanges = true;
            }
          });
        },

        // 切换当前场景
        setCurrentSceneIndex: (index) => {
          set((state) => {
            if (state.currentProject && index >= 0 && index < state.currentProject.scenes.length) {
              state.currentSceneIndex = index;
            }
          });
        },

        // 标记更改
        markAsChanged: () => {
          set((state) => {
            state.hasUnsavedChanges = true;
          });
        },

        // 清除错误
        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },
      })),
      {
        name: 'mapmotion-projects',
        partialize: (state) => ({
          projects: state.projects,
        }),
      }
    ),
    { name: 'ProjectStore' }
  )
);

export default useProjectStore;
