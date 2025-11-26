/**
 * 编辑器状态管理
 * 管理编辑器的工具、选择、视图等状态
 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { HistoryManager } from '@/core/history';

/** 编辑器工具类型 */
export type EditorTool = 'select' | 'pan' | 'zoom' | 'draw-point' | 'draw-line' | 'draw-polygon' | 'label';

/** 选择类型 */
export type SelectionType = 'layer' | 'feature' | 'keyframe' | 'label';

/** 选择项 */
export interface SelectionItem {
  type: SelectionType;
  id: string;
}

/** 视图模式 */
export type ViewMode = 'edit' | 'preview' | 'split';

/** 面板状态 */
export interface PanelState {
  sidebar: boolean;
  timeline: boolean;
  properties: boolean;
}

/** 编辑器状态接口 */
interface EditorState {
  /** 当前工具 */
  currentTool: EditorTool;
  /** 选中项列表 */
  selection: SelectionItem[];
  /** 视图模式 */
  viewMode: ViewMode;
  /** 面板显示状态 */
  panels: PanelState;
  /** 缩放比例 */
  zoom: number;
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 是否循环播放 */
  isLooping: boolean;
  /** 当前时间 (ms) */
  currentTime: number;
  /** 是否显示网格 */
  showGrid: boolean;
  /** 是否显示标尺 */
  showRulers: boolean;
  /** 是否吸附 */
  snapEnabled: boolean;
  /** 剪贴板数据 */
  clipboard: unknown | null;
  /** 错误消息 */
  error: string | null;
}

/** 编辑器操作接口 */
interface EditorActions {
  // 工具操作
  setTool: (tool: EditorTool) => void;
  
  // 选择操作
  select: (item: SelectionItem) => void;
  addToSelection: (item: SelectionItem) => void;
  removeFromSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: (items: SelectionItem[]) => void;
  
  // 视图操作
  setViewMode: (mode: ViewMode) => void;
  togglePanel: (panel: keyof PanelState) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  
  // 播放控制
  play: () => void;
  pause: () => void;
  stop: () => void;
  togglePlay: () => void;
  setCurrentTime: (time: number) => void;
  toggleLoop: () => void;
  
  // 视图选项
  toggleGrid: () => void;
  toggleRulers: () => void;
  toggleSnap: () => void;
  
  // 剪贴板操作
  copy: () => void;
  paste: () => void;
  cut: () => void;
  
  // 历史操作
  undo: () => void;
  redo: () => void;
  
  // 错误处理
  setError: (error: string | null) => void;
  clearError: () => void;
}

/** 初始状态 */
const initialState: EditorState = {
  currentTool: 'select',
  selection: [],
  viewMode: 'edit',
  panels: {
    sidebar: true,
    timeline: true,
    properties: true,
  },
  zoom: 1,
  isPlaying: false,
  isLooping: false,
  currentTime: 0,
  showGrid: true,
  showRulers: true,
  snapEnabled: true,
  clipboard: null,
  error: null,
};

/** 历史管理器实例 */
const historyManager = new HistoryManager<EditorState>({
  maxEntries: 50,
  mergeWindow: 500,
});

/**
 * 编辑器 Store
 */
export const useEditorStore = create<EditorState & EditorActions>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      // 工具操作
      setTool: (tool) => {
        set((state) => {
          state.currentTool = tool;
        });
      },

      // 选择操作
      select: (item) => {
        set((state) => {
          state.selection = [item];
        });
      },

      addToSelection: (item) => {
        set((state) => {
          if (!state.selection.find((s) => s.id === item.id)) {
            state.selection.push(item);
          }
        });
      },

      removeFromSelection: (id) => {
        set((state) => {
          state.selection = state.selection.filter((s) => s.id !== id);
        });
      },

      clearSelection: () => {
        set((state) => {
          state.selection = [];
        });
      },

      selectAll: (items) => {
        set((state) => {
          state.selection = items;
        });
      },

      // 视图操作
      setViewMode: (mode) => {
        set((state) => {
          state.viewMode = mode;
        });
      },

      togglePanel: (panel) => {
        set((state) => {
          state.panels[panel] = !state.panels[panel];
        });
      },

      setZoom: (zoom) => {
        set((state) => {
          state.zoom = Math.max(0.1, Math.min(zoom, 10));
        });
      },

      zoomIn: () => {
        set((state) => {
          state.zoom = Math.min(state.zoom * 1.25, 10);
        });
      },

      zoomOut: () => {
        set((state) => {
          state.zoom = Math.max(state.zoom / 1.25, 0.1);
        });
      },

      resetZoom: () => {
        set((state) => {
          state.zoom = 1;
        });
      },

      // 播放控制
      play: () => {
        set((state) => {
          state.isPlaying = true;
        });
      },

      pause: () => {
        set((state) => {
          state.isPlaying = false;
        });
      },

      stop: () => {
        set((state) => {
          state.isPlaying = false;
          state.currentTime = 0;
        });
      },

      togglePlay: () => {
        set((state) => {
          state.isPlaying = !state.isPlaying;
        });
      },

      setCurrentTime: (time) => {
        set((state) => {
          state.currentTime = Math.max(0, time);
        });
      },

      toggleLoop: () => {
        set((state) => {
          state.isLooping = !state.isLooping;
        });
      },

      // 视图选项
      toggleGrid: () => {
        set((state) => {
          state.showGrid = !state.showGrid;
        });
      },

      toggleRulers: () => {
        set((state) => {
          state.showRulers = !state.showRulers;
        });
      },

      toggleSnap: () => {
        set((state) => {
          state.snapEnabled = !state.snapEnabled;
        });
      },

      // 剪贴板操作
      copy: () => {
        const { selection } = get();
        if (selection.length > 0) {
          set((state) => {
            state.clipboard = JSON.parse(JSON.stringify(selection));
          });
        }
      },

      paste: () => {
        const { clipboard } = get();
        if (clipboard) {
          // 粘贴逻辑将在具体实现中处理
          console.log('[EditorStore] 粘贴:', clipboard);
        }
      },

      cut: () => {
        const { selection, copy, clearSelection } = get();
        if (selection.length > 0) {
          copy();
          // 删除逻辑将在具体实现中处理
          clearSelection();
        }
      },

      // 历史操作
      undo: () => {
        const previousState = historyManager.undo();
        if (previousState) {
          set(() => previousState);
        }
      },

      redo: () => {
        const nextState = historyManager.redo();
        if (nextState) {
          set(() => nextState);
        }
      },

      // 错误处理
      setError: (error) => {
        set((state) => {
          state.error = error;
        });
      },

      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },
    })),
    { name: 'editor-store' }
  )
);

/**
 * 获取历史管理器（用于外部访问）
 */
export function getHistoryManager(): HistoryManager<EditorState> {
  return historyManager;
}

/**
 * 记录历史状态
 */
export function recordHistory(description: string, mergeable = false): void {
  const state = useEditorStore.getState();
  const { undo, redo, setError, clearError, ...stateToSave } = state;
  historyManager.push(
    'editor',
    description,
    stateToSave as EditorState,
    stateToSave as EditorState,
    mergeable
  );
}

export default useEditorStore;
